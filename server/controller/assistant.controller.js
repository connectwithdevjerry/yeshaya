const axios = require("axios");
const userModel = require("../model/user.model");
const { OpenAI } = require("openai");
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const { VapiClient } = require("@vapi-ai/server-sdk");
const FormData = require("form-data");
const fs = require("fs");
const { fillTemplate } = require("../helperFunctions");
const { MAKE_OUTBOUND_CALL } = require("../constants");

const allowableTools = {
  scrape_website:
    "Allows the Al to look at a website. You can prompt the website to scrape or use the contact's website in your instructions.",
  update_user_details:
    "Updates the contact's information in the CRM. The fields that can be updated using this tool are first name, last name, email, phone number, full address, timezone and website.",
  search_the_web:
    "Searches the web and returns search engine answers to a query. Use this tool to search the web.",
  get_availability:
    "Gets your calendar availability. Always call this tool to get the most up-to-date information about your calendar ID's availability.",
  book_appointment:
    "Books an appointment with the user. Always get your availability before using this tool to confirm the chosen spot is still available before proceeding to book. Use this tool to book an appointment from an available...",
  get_user_calendar_events:
    "Gets all calendar events schedule with the user and data associated. Use this tool to check the user's current, past and future appointments and get appointment IDs for the events.",
};

const toolsProperties = {
  scrape_website: { property: {}, requiredValues: [] },
  update_user_details: { property: {}, requiredValues: [] },
  search_the_web: { property: {}, requiredValues: [] },
  get_availability: { property: {}, requiredValues: [] },
  book_appointment: { property: {}, requiredValues: [] },
  get_user_calendar_events: { property: {}, requiredValues: [] },
};

const toolData = (
  toolName,
  description,
  userCompName,
  userCompEmail,
  userId
) => ({
  type: "function",
  function: {
    name: toolName,
    description,
    parameters: {
      type: "object",
      properties: {
        firstName: { type: "string", description: userCompName },
        email: { type: "string", description: userCompEmail },
        startTime: {
          type: "string",
          description: new Date().toISOString(),
        },
      },
      required: ["firstName", "email", "startTime"],
    },
  },
  server: {
    url: `${process.env.SERVER_URL}/vapi-tool-webhook/${userId}`,
  },
});

const prompt = `
## Identity
You are James, a knowledgeable and approachable tax professional at Upscale BOS, a tax preparation and consulting firm in Boston. You provide exceptional customer support by answering questions about tax services, helping clients book appointments, and offering general tax guidance. You represent Upscale BOS with professionalism while maintaining a friendly, helpful demeanor that puts clients at ease when discussing their tax concerns.

## Personality Traits
- Confident and reassuring when discussing tax matters, helping clients feel secure in their decisions
- Patient and understanding, especially when explaining complex tax concepts to clients
- Detail-oriented but able to communicate clearly without overwhelming jargon
- Empathetic to client concerns about taxes, deadlines, and financial matters
- Proactive in suggesting appropriate services based on client needs
- Warm and personable, making tax discussions less intimidating

## Style Guardrails
Be Concise: Respond succinctly, addressing one topic at most.
Embrace Variety: Use diverse language and rephrasing to enhance clarity without repeating content.
Be Conversational: Use everyday language, making the chat feel like talking to a friend.
Be Proactive: Lead the conversation, often wrapping up with a question or next-step suggestion.
Avoid multiple questions in a single response.
Get clarity: If the user only partially answers a question, or if the answer is unclear, keep asking to get clarity.
Use a colloquial way of referring to the date (like Friday, Jan 14th, or Tuesday, Jan 12th, 2024 at 8am).
Avoid sending comments or markdown with links. Send links just as they are given to you.

## Response Guideline
Adapt and Guess: Try to understand transcripts that may contain transcription errors. Avoid mentioning "transcription error" in the response.
Stay in Character: Keep conversations within your role's scope, guiding them back creatively without repeating.
Ensure Fluid Dialogue: Respond in a role-appropriate, direct manner to maintain a smooth conversation flow.
If you do not know something for certain, it is fine to say you don't know. Avoid responding with information you are not 100% certain of.

## Tasks
1. Greet the user warmly and introduce yourself as a representative of Upscale BOS.
   - If the user provides their name, use it in your greeting and subsequent responses.
   - If not, politely ask for their name to personalize the conversation.

2. Determine the user's tax-related needs:
   - If they have questions about services, provide information about Upscale BOS offerings (Individual Tax Preparation, Contractor Tax Preparation, Business Tax Returns, Year-Round Services).
   - If they need tax advice, provide general guidance while noting that specific tax situations require a consultation.
   - If they want to book an appointment, proceed to Task 3.
   - If they have questions about rates or pricing, provide general information and refer to the website's Rates & FAQ section.

3. For appointment booking:
   - Ask if they prefer an in-office appointment at 695 Truman Parkway, Boston or a virtual consultation.
   - Use get_availability to check available appointment times.
   - Present options to the user and confirm their preference.
   - Collect necessary contact information (name, email, phone) using update_user_details.
   - Use book_appointment to schedule the confirmed time.
   - Send a confirmation message with appointment details.

4. For general inquiries:
   - Answer questions about tax deadlines, document requirements, and general tax processes.
   - If the question requires specialized knowledge, offer to create a note for a tax professional to follow up using create_note.
   - For complex situations, suggest booking a consultation for personalized advice.

5. For follow-up needs:
   - If the user needs additional information that requires research, offer to send an email with details using send_email.
   - If the user needs a reminder about tax deadlines or appointments, offer to create a task using create_task.
   - If appropriate, suggest self_schedule to arrange a follow-up conversation.

6. Before ending the conversation:
   - Confirm that all the user's questions have been answered.
   - Provide contact information (phone: (401) 429-9948, email: James@upscalebos.com) for future reference.
   - Thank them for choosing Upscale BOS for their tax needs.
`;

const VAPI_ASSISTANT_CONFIG = ({
  name,
  systemPrompt,
  voiceId = "en-US-EmmaNeural",
  v_provider = "azure",
  t_provider = "deepgram",
  t_model = "nova-2-phonecall",
}) => ({
  name,
  model: {
    model: "gpt-3.5-turbo",
    provider: "openai",
    systemPrompt,
    temperature: 0.7,
    maxTokens: 150,
  },
  voice: {
    voiceId,
    provider: v_provider,
  },
  firstMessage: prompt,
  language: "en",
  endCallPhrases: ["goodbye", "thanks, that's all"],
  transcriber: {
    provider: t_provider,
    model: t_model,
  },
  endCallFunctionEnabled: true,
});

/**
 * Creates a Vapi Assistant and saves the successful configuration to MongoDB via Mongoose.
 */

const generatePrompt = async (req, res) => {
  try {
    const userId = req.user;
    const { description } = req.body;

    if (!description) {
      return res.send({
        status: false,
        message: "Description is required",
      });
    }

    // Fetch master prompt (DB, config, or hardcoded for now)
    const masterPrompt = prompt;
    // or: const masterPrompt = process.env.MASTER_PROMPT;

    const user = await userModel.findById(userId);
    const openaiApiKey = user.openAIApiKey;

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const metaPrompt = `
You are a prompt generator.

Your task is to create a NEW prompt by following the exact structure, style, tone, and rules of the MASTER PROMPT provided.

Instructions:
- Carefully analyze the MASTER PROMPT.
- Preserve its format, sections, wording style, constraints, and control logic.
- Replace only the subject/context using the SHORT DESCRIPTION.
- Do not introduce new rules, sections, or explanations.
- Do not reference the master prompt or this instruction in the output.
- The result must be a fully usable standalone prompt.

MASTER PROMPT:
<<<
${masterPrompt}
>>>

SHORT DESCRIPTION:
<<<
${description}
>>>

Output:
Return ONLY the newly generated prompt.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.1,
      messages: [{ role: "user", content: metaPrompt }],
    });

    const generatedPrompt = completion.choices[0].message.content;

    return res.send({
      status: true,
      prompt: generatedPrompt,
    });
  } catch (error) {
    console.error("Prompt generation error:", error);

    return res.send({
      status: false,
      message:
        "Prompt generation failed: Kindly check your OpenAI API key connections.",
    });
  }
};

const getDynamicFMessage = async (req, res) => {
  const userId = req.user;
  const { assistantId, subaccountId } = req.query;

  try {
    const user = await userModel.findById(userId);
    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    // Return the dynamic message from the assistant
    return res.send({
      status: true,
      data: {
        inbound: targetAssistant.inboundDynamicMessage,
        outbound: targetAssistant.outboundDynamicMessage,
      },
    });
  } catch (error) {
    console.error("Error fetching dynamic message:", error);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const createAssistantAndSave = async (req, res) => {
  const userId = req.user;
  const { name, description, subaccountId } = req.body;
  const apiUrl = "https://api.vapi.ai/assistant";

  console.log(`Attempting to create Vapi Assistant at ${apiUrl}...`);

  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === subaccountId && sub.connected
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  try {
    // Using axios.post. The request body (VAPI_ASSISTANT_CONFIG) is passed directly.
    const response = await axios.post(
      apiUrl,
      VAPI_ASSISTANT_CONFIG({ name, prompt }),
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data; // Axios automatically parses JSON and puts the response body in .data

    const assistantId = data.id;
    console.log(`Assistant created successfully! ID: ${assistantId}`);

    // save data inside database

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected
    );

    targetSubaccount.vapiAssistants.push({ assistantId, description });
    user.markModified("ghlSubAccountIds");
    await user.save();

    console.log(`Successfully saved Assistant ID to User document in MongoDB.`);

    // return response
    return res.send({
      status: true,
      message: `Successfully saved Assistant configuration to MongoDB.`,
      data,
      // user,
    });
  } catch (error) {
    // Axios throws an error for non-2xx status codes (API errors)
    if (error.response) {
      return res.send({
        status: false,
        message: `VAPI API ERROR (${error.response.status}): Failed to create assistant.`,
        error: error.response.data,
      });
    } else if (error.request) {
      // Network error (no response received)
      return res.send({
        status: false,
        message: "NETWORK ERROR: No response received from Vapi API.",
      });
    } else {
      // This handles Mongoose save errors or other synchronous errors
      return res.send({
        status: false,
        message: error.message,
      });
    }
  }
};

const getAssistant = async (req, res) => {
  const userId = req.user;
  const { subaccountId, assistantId } = req.query;

  try {
    // find the user by id
    const user = await userModel.findById(userId);
    // user.ghlSubAccountIds.find()
    // find the subaccount the assistant belong to
    // check if the assistant is present, (important because, if this isn't done, someone that doen't own this can do so too once they have the assistant id)

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    const vapi = new VapiClient({
      token: VAPI_API_KEY,
    });
    // The .get(id) method calls the GET /assistant/:id API endpoint
    const assistant = await vapi.assistants.get(assistantId);

    console.log(
      `Successfully retrieved details for Assistant: ${assistant.name} (ID: ${assistant.id})`
    );

    // The 'assistant' object contains all configuration details (model, voice, tools, etc.)
    return res.send({
      status: true,
      data: assistant,
      message: `Successfully retrieved details for Assistant: ${assistant.name} (ID: ${assistant.id})`,
    });
  } catch (error) {
    console.error(`Error retrieving assistant ${assistantId}:`, error.message);
    return res.send({ status: false, message: error.message });
  }
};

const getAssistants = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId } = req.query;

    // get the user
    // get the subaccount he belongs to
    // return the lists of all vapi accounts present

    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId
      // && sub.connected
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const myVapiAssistants = targetSubaccount?.vapiAssistants;

    console.log({ myVapiAssistants });

    const mIm = await import("p-limit");
    const pLimit = mIm.default;

    const limit = pLimit(5);

    const requests = myVapiAssistants?.map(
      (myAssistant) =>
        myAssistant.assistantId &&
        limit(
          async () =>
            await axios.get(
              `https://api.vapi.ai/assistant/${myAssistant.assistantId}`,
              {
                headers: {
                  Authorization: `Bearer ${VAPI_API_KEY}`,
                  "Content-Type": "application/json",
                },
              }
            )
        )
    );

    // Run all requests in parallel
    const responses = await Promise.all(requests);

    console.log({ responses });

    // Extract the assistant data
    const assistants = responses.map((res) => res && res.data);

    console.log("Assistants fetched successfully:");
    console.log(assistants);

    return res.send({
      status: true,
      data: assistants,
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const updateAssistant = async (req, res) => {
  const userId = req.user;
  const { subaccountId, assistantId, updateData } = req.body;

  // const checkHeader = req

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      updateData,
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Assistant updated successfully:");
    console.log(response.data);

    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      "Failed to update assistant:",
      error.response?.data || error.message
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const deleteAssistant = async () => {
  const userId = req.user;
  const { subaccountId, assistantId } = req.query;

  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === subaccountId && sub.connected
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const updatedAssistants = targetSubaccount.vapiAssistants.filter(
    (target) => target.assistantId !== assistantId
  );

  try {
    const response = await axios.delete(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    targetSubaccount.vapiAssistants = [...updatedAssistants];
    user.markModified("ghlSubAccountIds");
    await user.save();

    console.log(`Assistant ${assistantId} deleted successfully.`);
    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      `Failed to delete assistant ${assistantId}:`,
      error.response?.data || error.message
    );

    return res.send({ status: true, message: error.message });
  }
};

const deleteNumberFromAssistant = async (req, res) => {
  const userId = req.user;
  let { phoneNum, subaccountId, assistantId } = req.query;

  // add + to phone number
  phoneNum = phoneNum.startsWith("+") ? phoneNum : `+${phoneNum.trim()}`;

  // const getPhoneNumId = await getVapiPhoneId(phoneNum);

  // if (!getPhoneNumId.status) {
  //   return res.send({
  //     status: false,
  //     message: getPhoneNumId.message,
  //   });
  // }

  // const phoneNumId = getPhoneNumId.vapiPhoneNumId;

  // get phoneNumId and phoneSid from database
  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === subaccountId && sub.connected
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const targetAssistant = targetSubaccount.vapiAssistants.find(
    (target) => target.assistantId === assistantId
  );

  if (!targetAssistant)
    return res.send({
      status: false,
      message: "This assistant does not exist!",
    });

  console.log({ phoneNum });
  console.log({ targetAssistant: targetAssistant.numberDetails });

  const numberDetails =
    targetAssistant.numberDetails.find((num) => num.phoneNum === phoneNum) ||
    {};

  const { vapiPhoneNumId: phoneNumId, phoneSid } = numberDetails;

  if (!phoneNumId || !phoneSid) {
    return res.send({
      status: false,
      message: "Phone number details not found in database.",
    });
  }

  const url = `https://api.vapi.ai/phone-number/${phoneNumId}`;

  try {
    // remove from vapi
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    // remove from twilio too
    await axios.delete(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers/${phoneSid}.json`,
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN,
        },
      }
    );

    // remove it from database too

    targetAssistant.numberDetails = targetAssistant.numberDetails.filter(
      (num) => num.phoneNum !== phoneNum
    );

    user.markModified("ghlSubAccountIds");
    await user.save();

    console.log(`Successfully deleted Vapi Phone Number ID: ${phoneNumId}`);

    return res.send({
      status: true,
      message: "Phone number deleted successfully.",
    });
  } catch (error) {
    if (error.response) {
      console.error(
        `Failed to delete Vapi Phone Number. Status: ${error.response.status}`,
        error.response.data
      );

      return res.send({
        status: false,
        message: "Failed to delete phone number.",
        details: error.response.data,
      });
    }

    // Network / config errors
    console.error("Axios request error:", error.message);

    return res.send({
      status: false,
      message: "Request failed.",
      details: error.message,
    });
  }
};

const getVapiPhoneId = async (phoneNum) => {
  // console.log(assistantId, phoneNum);
  try {
    // const VAPI_ASSISTANT_URL = `https://api.vapi.ai/assistant/${assistantId}/phone-numbers`;
    const VAPI_ASSISTANT_URL = `https://api.vapi.ai/phone-number`;

    const response = await axios.get(VAPI_ASSISTANT_URL, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const phoneNumbers = await response.data; // Assuming the response data is an array of phone number objects
    console.log({ phoneNumbers });

    const targetNumber = phoneNumbers.find(
      (num) => num.number === phoneNum.replace(" ", "+")
    );

    if (targetNumber) {
      return { status: true, vapiPhoneNumId: targetNumber.id };
    } else {
      return { status: false, message: "Phone number not found." };
    }
  } catch (error) {
    return { status: false, message: error.message };
  }
};

const createTool = async (
  toolName,
  description,
  userCompName,
  userCompEmail
) => {
  try {
    const response = await axios.post(
      "https://api.vapi.ai/tool",
      toolData(toolName, description, userCompName, userCompEmail),
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Tool Created! ID:", response.data.id);
    return { toolId: response.data.id };
  } catch (error) {
    console.error(
      "Error creating tool:",
      error.response?.data || error.message
    );
    return { message: error.response?.data || error.message };
  }
};

const linkToolToAssistant = async (assistantId, toolId) => {
  try {
    await axios.patch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        model: {
          tools: [
            {
              type: "function",
              toolId: toolId, // The ID returned from the creation step
            },
          ],
        },
      },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      }
    );
    console.log(`Tool ${toolId} linked to Assistant ${assistantId}`);
    return {
      status: true,
      message: `Tool ${toolId} linked to Assistant ${assistantId}`,
    };
  } catch (error) {
    console.error("Error linking tool:", error.response?.data || error.message);
    return {
      status: false,
      message: `Error linking tool: ${error.response?.data || error.message}`,
    };
  }
};

// start test from here
const addATool = async (req, res) => {
  const userId = req.user;
  const { assistantId, toolName } = req.body;

  const user = await userModel.findById(userId);
  const userCompName = user.company.name || user.firstName;
  const userCompEmail = user.email;

  const toolDescription = allowableTools[toolName];

  if (!toolDescription)
    return res.send({ status: false, message: "toolName not permitted!" });

  const toolCreateAttempt = await createTool(
    toolName,
    toolDescription,
    userCompName,
    userCompEmail
  );

  console.log({ toolCreateAttempt });

  if (toolCreateAttempt.message)
    return res.send({ status: false, message: toolCreateAttempt.message });

  // save tool id into database
  // get connected calendar ids and save them into database

  const linkToolAttempt = await linkToolToAssistant(
    assistantId,
    toolCreateAttempt.toolId
  );

  return res.send(linkToolAttempt);
};

const executeToolFromVapi = async (req, res) => {
  const { message } = req.body;
  const { userId } = req.params;
  if (message.type !== "tool-calls") return res.status(200).send();

  const toolCall = message.toolCalls[0];
  const assistantId = message.assistantId; // Vapi sends this automatically

  try {
    // 1. Find the User who owns this specific assistant
    const user = await userModel.findOne({
      "ghlSubAccountIds.vapiAssistants.assistantId": assistantId,
    });

    if (!user) {
      console.error("Assistant not found in database");
      return res.status(200).json({
        results: [{ toolCallId: toolCall.id, error: "Configuration error." }],
      });
    }

    // 2. Extract the specific Sub-Account and Assistant details
    // We search the nested arrays to find the matching IDs
    let targetSubAccount = null;
    let targetAssistant = null;

    for (const sub of user.ghlSubAccountIds) {
      const foundAssistant = sub.vapiAssistants.find(
        (a) => a.assistantId === assistantId
      );
      if (foundAssistant) {
        targetSubAccount = sub;
        targetAssistant = foundAssistant;
        break;
      }
    }

    // 3. Get Credentials
    const locationId = targetSubAccount.accountId;
    const calendarId = targetAssistant.calendar; // Uses the first calendar in your [String] array
    const refreshToken = user.ghlRefreshToken;

    // 4. IMPORTANT: GHL API v2 requires an Access Token (not just a refresh token)
    // You must have a helper to refresh this token, as they expire every 20 hours.
    const accessToken = await getFreshAccessToken(user);

    const { name, arguments: args } = toolCall.function;

    // 1 --- TOOL: CHECK AVAILABILITY ---
    if (name === "check_availability") {
      const { date } = args; // "YYYY-MM-DD"
      const startMs = new Date(`${date}T00:00:00Z`).getTime();
      const endMs = new Date(`${date}T23:59:59Z`).getTime();

      const response = await axios.get(
        `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots`,
        {
          params: { startDate: startMs, endDate: endMs },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        }
      );

      return res.json({
        results: [
          {
            toolCallId: toolCall.id,
            result: response.data.slots || "No slots found.",
          },
        ],
      });
    }

    // 2 --- TOOL: BOOK APPOINTMENT ---
    if (name === "book_appointment") {
      const { email, firstName, lastName, startTime } = args;

      // Step A: Upsert Contact
      const contactRes = await axios.post(
        "https://services.leadconnectorhq.com/contacts/upsert",
        { email, firstName, lastName, locationId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        }
      );

      // Step B: Create Event
      await axios.post(
        "https://services.leadconnectorhq.com/calendars/events",
        {
          calendarId,
          locationId,
          contactId: contactRes.data.contact.id,
          startTime,
          title: `Vapi Booking: ${firstName}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        }
      );

      return res.json({
        results: [{ toolCallId: toolCall.id, result: "Confirmed!" }],
      });
    }

    // 3 --- TOOL: UPDATE USER DETAILS ---
    if (name === "update_user_details") {
      const { firstName, lastName, email, phone, address, timezone, website } =
        args;

      // Use the accessToken from your helper function
      const accessToken = await getFreshAccessToken(user);

      const payload = {
        locationId: locationId, // Extracted from your ghlSubAccountIds array
        firstName,
        lastName,
        email,
        phone,
        address1: address, // GHL uses 'address1' for the primary address field
        timezone,
        website,
      };

      const response = await axios.post(
        "https://services.leadconnectorhq.com/contacts/upsert",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
            "Content-Type": "application/json",
          },
        }
      );

      return res.status(200).json({
        results: [
          {
            toolCallId: toolCall.id,
            result: `Successfully updated details for ${
              firstName || "the contact"
            }.`,
          },
        ],
      });
    }

    // 4 --- TOOL: SEARCH THE WEB ---
    if (name === "search_the_web") {
      const { query } = args;

      // We use Axios to call Tavily (requires a TAVILY_API_KEY in your .env)
      const searchResponse = await axios.post("https://api.tavily.com/search", {
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: "basic", // "advanced" for deeper research
        max_results: 5,
      });

      // Tavily returns an array of objects. We extract the 'content' for the LLM.
      const results = searchResponse.data.results
        .map((r) => `Source: ${r.title}\nContent: ${r.content}\nURL: ${r.url}`)
        .join("\n\n");

      return res.status(200).json({
        results: [
          {
            toolCallId: toolCall.id,
            result: results || "No search results found for this query.",
          },
        ],
      });
    }

    // 5 --- TOOL: GET USER CALENDAR EVENTS ---
    if (name === "get_user_calendar_events") {
      const { startDate, endDate } = args;

      // Use the accessToken from your helper function
      const accessToken = await getFreshAccessToken(user);

      // Default range: If AI doesn't provide dates, look from 30 days ago to 90 days ahead
      const startAt = startDate
        ? new Date(startDate).getTime()
        : Date.now() - 30 * 24 * 60 * 60 * 1000;
      const endAt = endDate
        ? new Date(endDate).getTime()
        : Date.now() + 90 * 24 * 60 * 60 * 1000;

      const response = await axios.get(
        `https://services.leadconnectorhq.com/calendars/events`,
        {
          params: {
            locationId: locationId,
            calendarId: calendarId,
            startTime: startAt,
            endTime: endAt,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        }
      );

      const events = response.data.events || [];

      // Format the response for the AI to read easily
      const eventSummary = events
        .map(
          (event) =>
            `Event: ${event.title}\n` +
            `ID: ${event.id}\n` +
            `Time: ${new Date(event.startTime).toLocaleString()}\n` +
            `Status: ${event.status}\n` +
            `Contact: ${event.contact?.firstName || "Unknown"}`
        )
        .join("\n---\n");

      return res.status(200).json({
        results: [
          {
            toolCallId: toolCall.id,
            result:
              events.length > 0
                ? eventSummary
                : "No appointments found for this period.",
          },
        ],
      });
    }

    // 6 --- TOOL: SCRAPE WEBSITE (FIRECRAWL IMPLEMENTATION) ---
    if (name === "scrape_website") {
      const { url } = args;

      if (!url) {
        return res.status(200).json({
          results: [
            { toolCallId: toolCall.id, error: "No URL provided to scrape." },
          ],
        });
      }

      // Firecrawl API call
      const firecrawlResponse = await axios.post(
        "https://api.firecrawl.dev/v1/scrape",
        {
          url: url,
          formats: ["markdown"], // Best format for Vapi/LLM processing
          onlyMainContent: true, // Removes headers, footers, and nav bars
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Firecrawl returns the result in data.markdown
      const markdownContent = firecrawlResponse.data.data.markdown;

      // Truncate to avoid hitting Vapi/LLM context limits (approx 8k-10k chars)
      const finalContent =
        markdownContent.length > 10000
          ? markdownContent.substring(0, 10000) + "... [Content Truncated]"
          : markdownContent;

      return res.status(200).json({
        results: [
          {
            toolCallId: toolCall.id,
            result: `Successfully scraped ${url}. Content: \n\n${finalContent}`,
          },
        ],
      });
    }
  } catch (error) {
    console.error("GHL Error:", error.response?.data || error.message);
    res.status(200).json({
      results: [{ toolCallId: toolCall.id, error: "Service unavailable." }],
    });
  }
};

const addCalendarId = async (req, res) => {
  const userId = req.user;
  const { accountId, assistantId, calendarId } = req.body;

  try {
    const result = await userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        // $addToSet ensures we don't add the same calendar ID twice
        $addToSet: {
          "ghlSubAccountIds.$[sub].vapiAssistants.$[ast].calendar": calendarId,
        },
      },
      {
        arrayFilters: [
          { "sub.accountId": accountId },
          { "ast.assistantId": assistantId },
        ],
      }
    );

    if (result.matchedCount === 0) {
      return res.send({
        status: false,
        message: "User or Assistant structure not found.",
      });
    }

    return res.send({
      status: true,
      message: "Calendar updated successfully.",
    });
  } catch (error) {
    console.error("Database Update Error:", error);
    return res.send({ status: false, error: error.message });
  }
};

const getAvailableCalendars = async (userId, accountId) => {
  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId && sub.connected
  );

  if (!targetSubaccount)
    return { status: false, message: "This subaccount does not exist!" };

  try {
    const response = await axios.get(
      `https://services.leadconnectorhq.com/calendars`,
      {
        params: { locationId: accountId },
        headers: {
          Authorization: `Bearer ${user.ghlRefreshToken}`,
          Version: "2021-07-28",
        },
      }
    );

    const calendars = response.data.calendars || [];

    return res.send({ status: true, data: calendars });
  } catch (error) {
    console.error("Error fetching calendars:", error.message);
    return res.send({ status: false, message: error.message });
  }
};

const getConnectedCalendar = async (req, res) => {
  const userId = req.user;
  const { accountId, assistantId } = req.query;
  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId && sub.connected
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const targetAssistant = targetSubaccount.vapiAssistants.find(
    (target) => target.assistantId === assistantId
  );

  if (!targetAssistant)
    return res.send({
      status: false,
      message: "This assistant does not exist!",
    });

  return res.send({
    status: true,
    data: targetAssistant.calendar || [],
  });
};

const deleteAssistantTool = async (req, res) => {
  const userId = req.user;
  const { accountId, assistantId, toolId } = req.body;

  try {
    const result = await userModel.updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $pull: {
          "ghlSubAccountIds.$[sub].vapiAssistants.$[ast].tools": { toolId },
        },
      },
      {
        arrayFilters: [
          { "sub.accountId": accountId },
          { "ast.assistantId": assistantId },
        ],
      }
    );

    if (result.matchedCount === 0) {
      return res.send({
        status: false,
        message: "User or Assistant structure not found.",
      });
    }

    // also delete in vapi
    await axios.delete(`https://api.vapi.ai/tool/${toolId}`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return res.send({
      status: true,
      message: "Tool deleted successfully.",
    });
  } catch (error) {
    console.error("Database Update Error:", error);
    return res.send({ status: false, error: error.message });
  }
};

const getAssistantTools = async (req, res) => {
  const userId = req.user;
  const { accountId, assistantId } = req.query;

  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId && sub.connected
  );
  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const targetAssistant = targetSubaccount.vapiAssistants.find(
    (target) => target.assistantId === assistantId
  );

  if (!targetAssistant)
    return res.send({
      status: false,
      message: "This assistant does not exist!",
    });

  try {
    const response = await axios.get(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const tools = response.data.model.tools || [];

    return res.send({
      status: true,
      data: tools,
    });
  } catch (error) {
    console.error("Error fetching assistant tools:", error.message);
    return res.send({ status: false, message: error.message });
  }
};

const addDynamicFMessageToDB = async (req, res) => {
  try {
    const userId = req.user;
    const { assistantId, message, type } = req.body;

    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some(
        (ast) => ast.assistantId === assistantId && sub.connected
      )
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    console.log(
      targetAssistant.inboundDynamicMessage,
      targetAssistant.outboundDynamicMessage
    );

    // save message into database
    if (type === "inbound") {
      targetAssistant.inboundDynamicMessage = message;
    } else if (type === "outbound") {
      targetAssistant.outboundDynamicMessage = message;
    }

    user.markModified("ghlSubAccountIds");
    await user.save();

    console.log(`Successfully saved dynamic greetings to MongoDB.`);

    return res.send({
      status: true,
      message: "Dynamic greetings saved successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to update dynamic greetings:",
      error.response?.data || error.message
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const addKnowledgeBase = async (req, res) => {
  const userId = req.user;
  const { assistantId, knowledgeBaseUrl, type } = req.body;

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some(
        (ast) => ast.assistantId === assistantId && sub.connected
      )
    );

    if (!targetSubaccount)
      return res.send({ status: false, message: "Subaccount not found!" });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );

    if (!targetAssistant)
      return res.send({ status: false, message: "Assistant does not exist!" });

    // --- STEP 1: HARVEST DATA (Firecrawl API vs Local File) ---
    let fileBuffer;
    let fileName;

    if (type === "url" || knowledgeBaseUrl.startsWith("http")) {
      console.log("Scraping website with Firecrawl API...");

      const firecrawlRes = await axios.post(
        "https://api.firecrawl.dev/v1/scrape",
        {
          url: knowledgeBaseUrl,
          formats: ["markdown"],
          onlyMainContent: true, // Optional: cleans up headers/footers
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!firecrawlRes.data.success) {
        throw new Error(
          `Firecrawl Error: ${firecrawlRes.data.error || "Unknown error"}`
        );
      }

      // Firecrawl returns the data inside data.data.markdown
      fileBuffer = Buffer.from(firecrawlRes.data.data.markdown);
      fileName = `scraped_${Date.now()}.md`;
    } else if (type === "file" || fs.existsSync(knowledgeBaseUrl)) {
      console.log("Processing local file...");
      fileBuffer = fs.readFileSync(knowledgeBaseUrl);
      fileName = knowledgeBaseUrl.split("/").pop();
    } else if (type === "faq") {
      // knowledgeBaseUrl expected as: [{q: "...", a: "..."}]
      const faqMd = knowledgeBaseUrl
        .map((f) => `Q: ${f.q}\nA: ${f.a}`)
        .join("\n\n");
      fileBuffer = Buffer.from(faqMd);
      fileName = `faq_${Date.now()}.md`;
    } else if (type === "text") {
      // knowledgeBaseUrl expected as: "This is my custom text..."
      fileBuffer = Buffer.from(knowledgeBaseUrl);
      fileName = `knowledge_${Date.now()}.txt`;
    }

    // --- STEP 2: UPLOAD TO VAPI ---
    const form = new FormData();
    form.append("file", fileBuffer, fileName);

    const uploadRes = await axios.post("https://api.vapi.ai/file", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${process.env.VAPI_TOKEN}`,
      },
    });

    const newFileId = uploadRes.data.id;

    // --- STEP 3: LINK TO ASSISTANT ---
    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        model: {
          knowledgeBase: {
            fileIds: [newFileId],
          },
        },
      },
      {
        headers: { Authorization: `Bearer ${process.env.VAPI_TOKEN}` },
      }
    );

    // Save knowledge base file ID to database
    if (!targetAssistant.knowledgeBaseFileIds) {
      targetAssistant.knowledgeBaseFileIds = [];
    }
    targetAssistant.knowledgeBaseFileIds.push(newFileId);
    user.markModified("ghlSubAccountIds");
    await user.save();

    console.log(
      `Knowledge base added and linked successfully to Assistant ${assistantId}.`
    );

    return res.send({ status: true, data: response.data, fileId: newFileId });
  } catch (error) {
    console.error(
      "Failed to add knowledge base:",
      error.response?.data || error.message
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const getKnowledgeBases = async (req, res) => {
  const userId = req.user;
  const { assistantId } = req.query;

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some(
        (ast) => ast.assistantId === assistantId && sub.connected
      )
    );

    if (!targetSubaccount)
      return res.send({ status: false, message: "Subaccount not found!" });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );

    if (!targetAssistant)
      return res.send({ status: false, message: "Assistant does not exist!" });

    return res.send({
      status: true,
      data: targetAssistant.knowledgeBaseFileIds || [],
    });
  } catch (error) {
    console.error("Failed to get knowledge bases:", error.message);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const getAssistantCallLogs = async (req, res) => {
  const { assistantIds } = req.body; // Expecting ["id1", "id2"]
  const vapiToken = process.env.VAPI_TOKEN;

  if (!Array.isArray(assistantIds) || assistantIds.length === 0) {
    return res.send({
      status: false,
      message: "Please provide an array of assistantIds.",
    });
  }

  try {
    // 1. Create a list of fetch promises for each Assistant ID
    const callRequests = assistantIds.map((id) =>
      axios.get(`https://api.vapi.ai/call`, {
        params: {
          assistantId: id,
          limit: 100, // Adjust limit as needed (Max 1000)
        },
        headers: { Authorization: `Bearer ${vapiToken}` },
      })
    );

    // 2. Execute all requests in parallel
    const responses = await Promise.all(callRequests);

    // 3. Extract data and flatten the multiple arrays into one
    const allCalls = responses.flatMap((response) => response.data);

    // 4. Sort by creation date (newest first)
    const sortedCalls = allCalls.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`Successfully retrieved ${sortedCalls.length} total calls.`);

    return res.send({
      status: true,
      totalCalls: sortedCalls.length,
      data: sortedCalls,
    });
  } catch (error) {
    console.error(
      "Error fetching Vapi calls:",
      error.response?.data || error.message
    );
    return res.send({
      status: false,
      message: "Failed to retrieve call logs",
      error: error.response?.data || error.message,
    });
  }
};

const getAssistantFullReport = async (req, res) => {
  const { assistantIds } = req.body;
  const vapiToken = process.env.VAPI_TOKEN;

  try {
    const reportPromises = assistantIds.map(async (id) => {
      // 1. Parallel fetch for Voice Calls and Text Messages/Chats
      const [callsRes, messagesRes] = await Promise.all([
        axios.get(`https://api.vapi.ai/call`, {
          params: { assistantId: id, limit: 1000 },
          headers: { Authorization: `Bearer ${vapiToken}` },
        }),
        axios.get(`https://api.vapi.ai/message`, {
          params: { assistantId: id, limit: 1000 },
          headers: { Authorization: `Bearer ${vapiToken}` },
        }),
      ]);

      const voiceData = callsRes.data;
      const textData = messagesRes.data;

      // 2. Initialize Aggregators
      const stats = {
        voice: {
          count: voiceData.length,
          minutes: 0,
          cost: 0,
          stt: 0,
          llm: 0,
          tts: 0,
          vapi: 0,
          transport: 0,
        },
        text: {
          count: textData.length,
          cost: 0,
          platformFees: 0,
          llmTokens: 0,
        },
      };

      // 3. Process Voice Call Granular Costs
      voiceData.forEach((call) => {
        stats.voice.cost += call.cost || 0;
        stats.voice.minutes += (call.durationSeconds || 0) / 60;
        if (call.costs) {
          call.costs.forEach((item) => {
            if (stats.voice.hasOwnProperty(item.type))
              stats.voice[item.type] += item.cost || 0;
          });
        }
      });

      // 4. Process Message/Chat Granular Costs
      textData.forEach((msg) => {
        stats.text.cost += msg.cost || 0;
        // Messages have a flat $0.005 platform fee + LLM token costs
        stats.text.platformFees += 0.005;
        stats.text.llmTokens += msg.cost - 0.005 > 0 ? msg.cost - 0.005 : 0;
      });

      return {
        assistantId: id,
        totalSpend: (stats.voice.cost + stats.text.cost).toFixed(4),
        voiceReport: {
          totalMinutes: stats.voice.minutes.toFixed(2),
          breakdown: {
            transcription: stats.voice.stt.toFixed(4),
            intelligence: stats.voice.llm.toFixed(4),
            voice_synthesis: stats.voice.tts.toFixed(4),
            vapi_orchestration: stats.voice.vapi.toFixed(4),
            telephony_fees: stats.voice.transport.toFixed(4),
          },
        },
        textReport: {
          totalMessages: stats.text.count,
          breakdown: {
            platform_fees: stats.text.platformFees.toFixed(4),
            intelligence: stats.text.llmTokens.toFixed(4),
          },
        },
      };
    });

    // Get Twilio reports for all numbers related to this user

    const twilioReportPromises = phoneNumbers.map(async (num) => {
      // A. Fetch Call Usage Costs for this specific number
      // Endpoint: https://api.twilio.com/2010-04-01/Accounts/{Sid}/Calls.json
      const callsRes = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Calls.json`,
        {
          params: { To: num, Status: "completed" },
          headers: { Authorization: twilioAuthHeader },
        }
      );

      // B. Fetch Monthly Lease (MRC)
      // Endpoint: https://api.twilio.com/2010-04-01/Accounts/{Sid}/IncomingPhoneNumbers.json
      const numbersRes = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/IncomingPhoneNumbers.json`,
        {
          params: { PhoneNumber: num },
          headers: { Authorization: twilioAuthHeader },
        }
      );

      const usageCost = (callsRes.data.calls || []).reduce(
        (acc, c) => acc + Math.abs(parseFloat(c.price || 0)),
        0
      );

      // Twilio doesn't always return the lease price in the list view,
      // standard US Local is $1.15. We check the 'bundle_sid' or 'capabilities' to infer.
      const leaseCost =
        numbersRes.data.incoming_phone_numbers &&
        numbersRes.data.incoming_phone_numbers.length > 0
          ? 1.15
          : 0;

      return {
        phoneNumber: num,
        telephonyUsage: usageCost.toFixed(4),
        monthlyLease: leaseCost.toFixed(2),
        totalTwilioCost: (usageCost + leaseCost).toFixed(4),
      };
    });

    // end of twilio report promises

    const [assistantReport, twilioReport] = await Promise.all([
      reportPromises,
      twilioReportPromises,
    ]);
    res.send({ status: true, data: { assistantReport, twilioReport } });
  } catch (error) {
    res.send({ status: false, message: error.message });
  }
};

const generateOutBoundCallUrl = async (req, res) => {
  const userId = req.user;
  const { assistantId } = req.query;

  return res.send({
    status: true,
    data: {
      url: `${process.env.SERVER_URL}/assistants${MAKE_OUTBOUND_CALL}?assistantId=${assistantId}&poutboundId=${userId}`,
    },
  });
};

// outbound call handler, check integrations controller for inbound call handlers
const makeOutboundCall = async (req, res) => {
  console.log("Initiating outbound call...");
  const { assistantId, poutboundId } = req.query;
  const { customerNumber, fromNumber, dynamicValues } = req.body;

  try {
    const userId = poutboundId;

    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some(
        (ast) => ast.assistantId === assistantId && sub.connected
      )
    );

    if (!targetSubaccount)
      return res.send({ status: false, message: "Subaccount not found!" });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId
    );
    const targetPhoneNumber = targetAssistant.numberDetails.find(
      (number) => number.phoneNum === fromNumber
    );

    console.log({ mtargetPhoneNumber: targetAssistant.numberDetails });

    const VAPI_PHONE_NUMBER_ID = targetPhoneNumber?.vapiPhoneNumId;

    if (!VAPI_PHONE_NUMBER_ID)
      return res.send({
        status: false,
        message: "From number not linked to assistant",
      });

    if (!targetAssistant)
      return res.send({ status: false, message: "Assistant does not exist!" });

    const outboundDynamicMessage = targetAssistant.outboundDynamicMessage;

    const message = fillTemplate(outboundDynamicMessage, dynamicValues);

    const response = await axios.post(
      "https://api.vapi.ai/call",
      {
        assistantId: assistantId,
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        customer: {
          number: customerNumber, // Format: +1234567890
        },
        assistantOverrides: {
          firstMessage: message || undefined,
          firstMessageMode: message
            ? "assistant-speaks-first"
            : "assistant-speaks-first-with-model-generated-message",
        },
      },
      {
        headers: { Authorization: `Bearer ${process.env.VAPI_TOKEN}` },
      }
    );

    console.log(
      `Outbound call initiated from ${fromNumber} to ${customerNumber} via Assistant ${assistantId}.`
    );

    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      "Failed to initiate outbound call:",
      error.response?.data || error.message
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

// instructions for 1. call settings, enable recording, max call time, silence timeout, background noise and volume, silence timeout, rules of engagement, enable voicemail detection and message, incoming call webhook, post call webhook

// record, sleep mode, enable purposeful misspellings, response channels

// 2. greeting message, 3. end call message, 4. voicemail message, 5. error message

// Execute the main function
module.exports = {
  createAssistantAndSave,
  getAssistant,
  getAssistants,
  updateAssistant,
  deleteAssistant,
  generatePrompt,
  deleteNumberFromAssistant,
  getVapiPhoneId,
  addATool,
  deleteAssistantTool,
  addCalendarId,
  getAssistantTools,
  addDynamicFMessageToDB,
  addKnowledgeBase,
  getKnowledgeBases,
  getAssistantCallLogs,
  getAssistantFullReport,
  makeOutboundCall,
  getAvailableCalendars,
  getConnectedCalendar,
  generateOutBoundCallUrl,
  getDynamicFMessage,
};
