const axios = require("axios");
const userModel = require("../model/user.model");
const { OpenAI } = require("openai");
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const { VapiClient } = require("@vapi-ai/server-sdk");
const FormData = require("form-data");
const fs = require("fs");
const { fillTemplate, extractText } = require("../helperFunctions");
const { MAKE_OUTBOUND_CALL } = require("../constants");
const emailHelper = require("../resendObject");

const toolsProperties = {
  scrape_website: {
    description:
      "Allows the Al to look at a website. You can prompt the website to scrape or use the contact's website in your instructions.",
    properties: {
      url: { type: "string", description: "The URL of the website to scrape" },
    },
    requiredValues: ["url"],
  },
  update_user_details: {
    description:
      "Updates the contact's information in the CRM. The fields that can be updated using this tool are first name, last name, email, phone number, full address, timezone and website.",
    properties: {
      firstName: { type: "string", description: "The customer's first name" },
      lastName: { type: "string", description: "The customer's last name" },
      email: { type: "string", description: "The customer's email address" },
      notes: {
        type: "string",
        description:
          "Any additional context or preferences the customer mentioned",
      },
    },
    required: ["firstName"],
  },
  search_the_web: {
    description:
      "Searches the web and returns search engine answers to a query. Use this tool to search the web.",
    properties: {
      query: {
        type: "string",
        description: "The specific search string to look up on Google or Bing.",
      },
      search_type: {
        type: "string",
        enum: ["news", "general", "places"],
        description: "The type of search to perform.",
      },
    },
    required: ["query"],
  },
  check_availability: {
    description:
      "Gets your calendar availability. Always call this tool to get the most up-to-date information about your calendar ID's availability.",
    properties: {
      startTime: {
        type: "string",
        description:
          "The ISO 8601 timestamp to start checking from (e.g., 2024-05-01T09:00:00Z)",
      },
      endTime: {
        type: "string",
        description: "The ISO 8601 timestamp to stop checking at.",
      },
      timezone: {
        type: "string",
        description: "The customer's timezone (e.g., 'America/New_York')",
      },
    },
    required: ["startTime"],
  },
  book_appointment: {
    description:
      "Books an appointment with the user. Always get your availability before using this tool to confirm the chosen spot is still available before proceeding to book. Use this tool to book an appointment from an available...",
    properties: {
      customerName: { type: "string", description: "The name of the caller" },
      customerEmail: { type: "string", description: "The email of the caller" },
      requestedTime: {
        type: "string",
        description: "The ISO string of the appointment time",
      },
    },
    requiredValues: ["customerName", "customerEmail", "requestedTime"],
  },
  get_user_calendar_events: {
    description:
      "Gets all calendar events schedule with the user and data associated. Use this tool to check the user's current, past and future appointments and get appointment IDs for the events.",
    properties: {
      startDate: {
        type: "string",
        description:
          "The start date and time to begin fetching events from (ISO 8601 format).",
      },
      endDate: {
        type: "string",
        description:
          "The end date and time to stop fetching events (ISO 8601 format).",
      },
    },
    required: ["startDate"],
  },
  send_message: {
    description:
      "Sends an email message to the user. Use this tool to send important information, confirmations, or follow-up details via email.",
    properties: {
      recipientEmail: {
        type: "string",
        description: "The email address of the recipient",
      },
      subject: {
        type: "string",
        description: "The subject line of the email",
      },
      message: {
        type: "string",
        description: "The body content of the email message",
      },
    },
    required: ["recipientEmail", "subject", "message"],
  },
  self_schedule: {
    description:
      "Automatically creates a schedule or appointment in GoHighLevel calendar. Use this tool to schedule meetings, follow-ups, or appointments based on user preferences.",
    properties: {
      customerName: {
        type: "string",
        description: "The name of the customer to schedule",
      },
      customerEmail: {
        type: "string",
        description: "The email address of the customer",
      },
      startTime: {
        type: "string",
        description: "The ISO 8601 timestamp for the appointment start time",
      },
      title: {
        type: "string",
        description: "The title or description of the scheduled appointment",
      },
    },
    required: ["customerName", "customerEmail", "startTime"],
  },
  create_task: {
    description:
      "Creates a task in GoHighLevel for a contact. Use this tool to create reminders, follow-up tasks, or action items related to a customer.",
    properties: {
      customerEmail: {
        type: "string",
        description: "The email address of the customer to create the task for",
      },
      customerName: {
        type: "string",
        description: "The name of the customer",
      },
      title: {
        type: "string",
        description: "The title or description of the task",
      },
      dueDate: {
        type: "string",
        description:
          "The ISO 8601 timestamp for when the task is due (optional)",
      },
      body: {
        type: "string",
        description: "Additional details or notes about the task (optional)",
      },
    },
    required: ["customerEmail", "title"],
  },
  add_note: {
    description:
      "Adds a team note to the assistant's configuration. Use this tool to save important information, context, or instructions that should be remembered for future conversations.",
    properties: {
      note: {
        type: "string",
        description: "The team note content to add to the assistant",
      },
    },
    required: ["note"],
  },
};

const toolData = (toolName, userId) => ({
  type: "function",
  function: {
    name: toolName,
    description: toolsProperties[toolName].description,
    parameters: {
      type: "object",
      properties: toolsProperties[toolName].properties,
      required:
        toolsProperties[toolName].required ||
        toolsProperties[toolName].requiredValues ||
        [],
    },
  },
  server: {
    url: `${process.env.SERVER_URL}/assistants/vapi-tool-webhook/${userId}`,
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
   - Use check_availability and get_user_calendar_events to check available appointment times.
   - Present options to the user and confirm their preference.
   - Collect necessary contact information (name, email, phone) using update_user_details.
   - Use book_appointment to schedule the confirmed time.
   - Send a confirmation message with appointment details.

4. For general inquiries:
   - Answer questions about tax deadlines, document requirements, and general tax processes.
   - If the question requires specialized knowledge, offer to create a note for a tax professional to follow up using add_note.
   - For complex situations, suggest booking a consultation for personalized advice.
   - If you need to search the web at anytime use search_the_web, if the user gives a particular website use scrape_website

5. For follow-up needs:
   - If the user needs additional information that requires research, offer to send an email with details using send_message.
   - If the user needs a reminder about tax deadlines or appointments, offer to create a task using create_task.
   - If appropriate, suggest self_schedule to arrange a follow-up conversation.

6. Before ending the conversation:
   - Confirm that all the user's questions have been answered.
   - Provide contact information (phone: ‪+1 (857) 285‑0915‬, email: Yashayah617@gmail.com) for future reference.
   - Thank them for choosing Upscale BOS for their tax needs.

`;

const VAPI_ASSISTANT_CONFIG = ({
  name,
  prompt,
  voiceId = "en-US-EmmaNeural",
  v_provider = "azure",
  t_provider = "deepgram",
  t_model = "nova-2-phonecall",
}) => ({
  name,
  model: {
    model: "gpt-3.5-turbo",
    provider: "openai",
    systemPrompt: prompt,
    temperature: 0.7,
    maxTokens: 150,
  },
  server: {
    url: `${process.env.SERVER_URL}/integrations/billing/webhook`,
    timeoutSeconds: 20, // Optional: time to wait for your server to respond
  },
  voice: {
    voiceId,
    provider: v_provider,
  },
  firstMessage: "Hello! How can I assist you today?",
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
      (sub) => sub.accountId === subaccountId && sub.connected,
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
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

  console.log({ subaccountId });

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId == subaccountId && sub.connected
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
      },
    );

    const data = response.data; // Axios automatically parses JSON and puts the response body in .data

    const assistantId = data.id;
    console.log(`Assistant created successfully! ID: ${assistantId}`);

    // Automatically add default tools: send_message and self_schedule
    const defaultTools = ["send_message", "self_schedule"];
    const toolIds = [];

    for (const toolName of defaultTools) {
      // try {
      const toolId = await createTool(toolName, userId);
      toolIds.push(toolId);
      console.log(`Created default tool ${toolName} with ID: ${toolId}`);
    }

    // Link all tools to the assistant
    for (const toolId of toolIds) {
      // try {
      await linkToolToAssistant(assistantId, toolId, userId);
      console.log(`Linked tool ${toolId} to assistant ${assistantId}`);
    }

    // save data inside database

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected,
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
      (sub) => sub.accountId === subaccountId && sub.connected,
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
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
      `Successfully retrieved details for Assistant: ${assistant?.model?.prompt} (ID: ${assistant.id})`,
    );

    console.log(assistant.model.systemPrompt);

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
      (sub) => sub.accountId === subaccountId,
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
              },
            ),
        ),
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
      (sub) => sub.accountId === subaccountId && sub.connected,
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
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
      },
    );

    console.log("Assistant updated successfully:");
    console.log(response.data);

    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      "Failed to update assistant:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const deleteAssistant = async (req, res) => {
  const userId = req.user;
  const { subaccountId, assistantId } = req.query;

  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === subaccountId && sub.connected,
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const updatedAssistants = targetSubaccount.vapiAssistants.filter(
    (target) => target.assistantId !== assistantId,
  );

  try {
    const response = await axios.delete(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    targetSubaccount.vapiAssistants = [...updatedAssistants];
    user.markModified("ghlSubAccountIds");
    await user.save();

    console.log(`Assistant ${assistantId} deleted successfully.`);
    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      `Failed to delete assistant ${assistantId}:`,
      error.response?.data || error.message,
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
    (sub) => sub.accountId === subaccountId && sub.connected,
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const targetAssistant = targetSubaccount.vapiAssistants.find(
    (target) => target.assistantId === assistantId,
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
        Authorization: `Bearer ${VAPI_API_KEY}`,
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
      },
    );

    // remove it from database too

    targetAssistant.numberDetails = targetAssistant.numberDetails.filter(
      (num) => num.phoneNum !== phoneNum,
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
        error.response.data,
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
      (num) => num.number === phoneNum.replace(" ", "+"),
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

const createTool = async (toolName, userId) => {
  try {
    const response = await axios.post(
      "https://api.vapi.ai/tool",
      toolData(toolName, userId),
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Tool Created! ID:", response.data.id);
    return response.data.id;
  } catch (error) {
    console.error(
      "Error creating tool:",
      error.response?.data || error.message,
    );
    throw new Error(
      `Error creating tool: ${error.response?.data || error.message}`,
    );
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user;
    const user = await userModel.findById(userId);

    if (!user) return res.send({ message: "User not found" });

    // 1. Gather distinct Assistant IDs and Phone counts
    let assistantIds = [];
    let phoneNumbersCount = 0;

    user.ghlSubAccountIds.forEach((sub) => {
      sub.vapiAssistants.forEach((ast) => {
        assistantIds.push(ast.assistantId);
        phoneNumbersCount += ast.numberDetails.length;
      });
    });

    // Remove duplicates to avoid redundant API calls
    const uniqueAssistantIds = [...new Set(assistantIds)];

    // 2. Fetch Call Logs in Parallel
    // Each ID gets its own dedicated request
    const callRequests = uniqueAssistantIds.map((id) =>
      axios.get(`https://api.vapi.ai/call`, {
        params: { assistantId: id },
        headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
      }),
    );

    const responses = await Promise.all(callRequests);

    // Flatten the array of arrays into a single list of calls
    const calls = responses.flatMap((r) => r.data);

    // 3. Aggregate Metrics
    const stats = {
      phoneNumbersBought: phoneNumbersCount,
      numberOfAssistants: uniqueAssistantIds.length,
      totalCalls: calls.length,
      inboundCalls: calls.filter((c) => c.type === "inboundPhoneCall").length,
      outboundCalls: calls.filter((c) => c.type === "outboundPhoneCall").length,
      webCalls: calls.filter((c) => c.type === "webCall").length,

      // End Reasons
      contactEnds: calls.filter((c) => c.endedReason === "customer-ended-call")
        .length,
      aiEnds: calls.filter((c) => c.endedReason === "assistant-ended-call")
        .length,
      voicemails: calls.filter((c) => c.endedReason === "voicemail").length,

      // Transfers & Appointments
      transfers: calls.filter(
        (c) =>
          c.status === "transferred" ||
          c.artifact?.messages?.some(
            (m) => m.role === "tool" && m.name === "transferCall",
          ),
      ).length,
      appointments: calls.filter(
        (c) =>
          c.analysis?.successEvaluation === "true" ||
          c.analysis?.successEvaluation === true,
      ).length,

      // Time & Cost
      totalCallTimeSeconds: calls.reduce(
        (acc, c) => acc + (c.durationSeconds || 0),
        0,
      ),
      totalSpend: calls.reduce((acc, c) => acc + (c.cost || 0), 0),
    };

    // 4. Derived Calculations
    const avgCallTime =
      stats.totalCalls > 0 ? stats.totalCallTimeSeconds / stats.totalCalls : 0;
    const costPerDial =
      stats.totalCalls > 0 ? stats.totalSpend / stats.totalCalls : 0;
    const costPerTransfer =
      stats.transfers > 0 ? stats.totalSpend / stats.transfers : 0;
    const costPerAppointment =
      stats.appointments > 0 ? stats.totalSpend / stats.appointments : 0;

    return res.send({
      status: true,
      data: {
        ...stats,
        avgCallTimeMinutes: (avgCallTime / 60).toFixed(2),
        costPerDial: costPerDial.toFixed(2),
        costPerTransfer: costPerTransfer.toFixed(2),
        costPerAppointment: costPerAppointment.toFixed(2),
        totalSpendFormatted: `$${stats.totalSpend.toFixed(2)}`,
        totalCallTimeFormatted: `${Math.floor(stats.totalCallTimeSeconds / 60)}m ${Math.round(stats.totalCallTimeSeconds % 60)}s`,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error.response?.data || error.message);
    return res.send({ status: false, message: "Failed to fetch analytics" });
  }
};

const linkToolToAssistant = async (assistantId, toolId, userId) => {
  try {
    const vapi = new VapiClient({
      token: VAPI_API_KEY,
    });

    // 1. Update the Assistant on Vapi's side
    const massistant = await vapi.assistants.get(assistantId);
    let updatedTools = [...(massistant.model.toolIds || [])];

    if (toolId && !updatedTools.includes(toolId)) {
      updatedTools.push(toolId);
    }

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        model: {
          provider: massistant.model.provider || "openai",
          model: massistant.model.model || "gpt-4o",
          ...massistant.model,
          toolIds: updatedTools,
        },
      },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      },
    );

    // 2. Update your local MongoDB database
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    let assistantFoundInDb = false;

    for (const sub of user.ghlSubAccountIds) {
      const foundAssistant = sub.vapiAssistants.find(
        (a) => a.assistantId === assistantId,
      );

      if (foundAssistant) {
        // Initialize the array if it doesn't exist
        if (!foundAssistant.connectedTools) {
          foundAssistant.connectedTools = [];
        }

        // Check for duplicates before pushing
        const isAlreadyLinked = foundAssistant.connectedTools.includes(toolId);

        if (!isAlreadyLinked && toolId) {
          foundAssistant.connectedTools.push(toolId);
          assistantFoundInDb = true;
        }
        break; // Stop looking once the assistant is found and updated
      }
    }

    if (assistantFoundInDb) {
      // Mark as modified because ghlSubAccountIds is a nested array
      user.markModified("ghlSubAccountIds");
      await user.save();
    }

    return toolId;
  } catch (error) {
    console.error("Error linking tool:", error.response?.data || error.message);
    throw new Error(
      `Error linking tool: ${error.response?.data || error.message}`,
    );
  }
};

// start test from here
const addATool = async (req, res) => {
  try {
    const userId = req.user;
    const { assistantId, toolName } = req.body;

    const toolId = await createTool(toolName, userId);

    console.log({ toolId });

    // save tool id into database
    // get connected calendar ids and save them into database

    const data = await linkToolToAssistant(assistantId, toolId, userId);

    return res.send({ status: true, data });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const executeToolFromVapi = async (req, res) => {
  const { message } = req.body;
  const { userId } = req.params;

  console.log("Received Vapi Tool Webhook:", message);

  if (message.type !== "tool-calls") return res.send();

  console.log("Received tool call from Vapi:", message);

  console.log("..........................................................");

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
        (a) => a.assistantId === assistantId,
      );
      if (foundAssistant) {
        targetSubAccount = sub;
        targetAssistant = foundAssistant;
        break;
      }
    }

    // 3. Get Credentials
    const locationId = targetSubAccount.accountId;
    const calendarId = targetAssistant.calendar; // Uses the first calendar

    // 4. IMPORTANT: GHL API v2 requires an Access Token (not just a refresh token)
    // You must have a helper to refresh this token, as they expire every 20 hours.
    const tkns = await getSubGhlTokens(userId, locationId);

    const accessToken = tkns.data.access_token;

    const { name, arguments: args } = toolCall.function;

    // 1 --- TOOL: CHECK AVAILABILITY ---
    if (name === "check_availability") {
      const { startTime } = args; // "YYYY-MM-DD"
      const startMs = new Date(`${startTime}T00:00:00Z`).getTime();
      const endMs = new Date(`${startTime}T23:59:59Z`).getTime();

      const response = await axios.get(
        `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots`,
        {
          params: { startDate: startMs, endDate: endMs },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        },
      );
      // Return available slots to Vapi
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
      const { customerEmail, customerName, startTime } = args;

      // Step A: Upsert Contact
      const contactRes = await axios.post(
        "https://services.leadconnectorhq.com/contacts/upsert",
        { email: customerEmail, firstName: customerName, locationId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        },
      );

      // Step B: Create Event
      await axios.post(
        "https://services.leadconnectorhq.com/calendars/events",
        {
          calendarId,
          locationId,
          contactId: contactRes.data.contact.id,
          startTime,
          title: `Vapi Booking: ${customerName}`,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28",
          },
        },
      );

      return res.json({
        results: [{ toolCallId: toolCall.id, result: "Confirmed!" }],
      });
    }

    // 3 --- TOOL: UPDATE USER DETAILS ---
    if (name === "update_user_details") {
      const { firstName, lastName, email } = args;
      // phone,address,timezone,website

      // Use the accessToken (already retrieved above)

      const payload = {
        locationId: locationId, // Extracted from your ghlSubAccountIds array
        firstName,
        lastName,
        email,
        // phone,
        // address1: address, // GHL uses 'address1' for the primary address field
        // timezone,
        // website,
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
        },
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
        },
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
            `Contact: ${event.contact?.firstName || "Unknown"}`,
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
        },
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

    // 7 --- TOOL: SEND MESSAGE (EMAIL) ---
    if (name === "send_message") {
      const { recipientEmail, subject, message } = args;

      if (!recipientEmail || !subject || !message) {
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error:
                "Missing required fields: recipientEmail, subject, or message.",
            },
          ],
        });
      }

      try {
        // Send email using Resend
        await emailHelper(recipientEmail, subject, message);

        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              result: `Email sent successfully to ${recipientEmail}.`,
            },
          ],
        });
      } catch (error) {
        console.error("Error sending email:", error.message);
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error: `Failed to send email: ${error.message}`,
            },
          ],
        });
      }
    }

    // 8 --- TOOL: SELF SCHEDULE (GOHIGHLEVEL) ---
    if (name === "self_schedule") {
      const { customerName, customerEmail, startTime, title } = args;

      if (!customerName || !customerEmail || !startTime) {
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error:
                "Missing required fields: customerName, customerEmail, or startTime.",
            },
          ],
        });
      }

      try {
        // Get fresh access token
        const tkns = await getSubGhlTokens(userId, locationId);
        const accessToken = tkns.data.access_token;

        // Step A: Upsert Contact
        const contactRes = await axios.post(
          "https://services.leadconnectorhq.com/contacts/upsert",
          {
            email: customerEmail,
            firstName: customerName,
            locationId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Version: "2021-07-28",
            },
          },
        );

        // Step B: Create Event/Appointment
        await axios.post(
          "https://services.leadconnectorhq.com/calendars/events",
          {
            calendarId,
            locationId,
            contactId: contactRes.data.contact.id,
            startTime,
            title: title || `Scheduled: ${customerName}`,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Version: "2021-07-28",
            },
          },
        );

        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              result: `Successfully scheduled appointment for ${customerName} at ${new Date(startTime).toLocaleString()}.`,
            },
          ],
        });
      } catch (error) {
        console.error(
          "Error creating schedule:",
          error.response?.data || error.message,
        );
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error: `Failed to create schedule: ${error.response?.data?.message || error.message}`,
            },
          ],
        });
      }
    }

    // 9 --- TOOL: CREATE TASK (GOHIGHLEVEL) ---
    if (name === "create_task") {
      const { customerEmail, customerName, title, dueDate, body } = args;

      if (!customerEmail || !title) {
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error: "Missing required fields: customerEmail and title.",
            },
          ],
        });
      }

      try {
        // Get fresh access token
        const tkns = await getSubGhlTokens(userId, locationId);
        const accessToken = tkns.data.access_token;

        // Step A: Upsert Contact to get contactId
        const contactRes = await axios.post(
          "https://services.leadconnectorhq.com/contacts/upsert",
          {
            email: customerEmail,
            firstName: customerName,
            locationId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Version: "2021-07-28",
            },
          },
        );

        const contactId = contactRes.data.contact.id;

        // Step B: Create Task
        const taskPayload = {
          title,
          ...(body && { body }),
          ...(dueDate && { dueDate }),
        };

        await axios.post(
          `https://services.leadconnectorhq.com/contacts/${contactId}/tasks`,
          taskPayload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Version: "2021-07-28",
            },
          },
        );

        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              result: `Successfully created task "${title}" for ${customerName || customerEmail}.`,
            },
          ],
        });
      } catch (error) {
        console.error(
          "Error creating task:",
          error.response?.data || error.message,
        );
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error: `Failed to create task: ${error.response?.data?.message || error.message}`,
            },
          ],
        });
      }
    }

    // 10 --- TOOL: ADD NOTE (TEAM NOTES) ---
    if (name === "add_note") {
      const { note } = args;

      if (!note) {
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error: "Missing required field: note.",
            },
          ],
        });
      }

      try {
        // Use the user object already retrieved at the beginning of the function
        // Find the specific assistant and update teamNotes
        // Note: targetAssistant is already found at the beginning of the function
        if (targetAssistant) {
          // Append to existing notes or create new
          const existingNotes = targetAssistant.teamNotes || "";
          const timestamp = new Date().toISOString();
          const newNote = existingNotes
            ? `${existingNotes}\n\n[${timestamp}] ${note}`
            : `[${timestamp}] ${note}`;
          targetAssistant.teamNotes = newNote;

          user.markModified("ghlSubAccountIds");
          await user.save();

          return res.status(200).json({
            results: [
              {
                toolCallId: toolCall.id,
                result: "Team note added successfully to the assistant.",
              },
            ],
          });
        } else {
          return res.status(200).json({
            results: [
              {
                toolCallId: toolCall.id,
                error: "Could not find assistant to update.",
              },
            ],
          });
        }
      } catch (error) {
        console.error(
          "Error adding team note:",
          error.response?.data || error.message,
        );
        return res.status(200).json({
          results: [
            {
              toolCallId: toolCall.id,
              error: `Failed to add team note: ${error.response?.data?.message || error.message}`,
            },
          ],
        });
      }
    }
  } catch (error) {
    console.error("GHL Error:", error.response?.data || error.message);
    res.status(200).json({
      results: [{ toolCallId: toolCall.id, error: "Service unavailable." }],
    });
  }
};

const getSubGhlTokens = async (userId, accountId) => {
  const user = await userModel.findById(userId);
  const ghlSubAccountIds = user.ghlSubAccountIds;
  const SUB_CLIENT_ID = process.env.GHL_SUB_CLIENT_ID;
  const SUB_CLIENT_SECRET = process.env.GHL_SUB_CLIENT_SECRET;

  const targetSubaccount = ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId && sub.connected,
  );

  const refreshToken = targetSubaccount.ghlSubRefreshToken;

  console.log({ refreshToken });

  try {
    const url = "https://services.leadconnectorhq.com/oauth/token";

    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const response = await axios.post(
      url,
      {
        client_id: SUB_CLIENT_ID,
        client_secret: SUB_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        user_type: "Location",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // httpsAgent, // attach secure agent
        timeout: 10000, // optional safety timeout
      },
    );

    targetSubaccount.ghlSubRefreshToken = response.data.refresh_token;
    targetSubaccount.ghlSubRefreshTokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000,
    );
    user.markModified("ghlSubAccountIds");
    await user.save();

    return { status: true, data: response.data };
  } catch (error) {
    console.error(
      "Error refreshing GHL Access Token:",
      error.response?.data || error.message,
    );
    throw Error(error.message);
  }
};

const addCalendarId = async (req, res) => {
  const userId = req.user;
  const { accountId, assistantId, calendarId } = req.body;

  try {
    const result = await userModel.updateOne(
      { _id: userId },
      {
        $set: {
          // Use $set to assign the string value directly
          "ghlSubAccountIds.$[sub].vapiAssistants.$[ast].calendar": calendarId,
        },
      },
      {
        arrayFilters: [
          { "sub.accountId": accountId },
          { "ast.assistantId": assistantId },
        ],
      },
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

const getAvailableCalendars = async (req, res) => {
  const userId = req.user;
  const { subaccountId: accountId } = req.query;

  const user = await userModel.findById(userId);

  const targetSubaccount = user.ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId && sub.connected,
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  try {
    const tkns = await getSubGhlTokens(userId, accountId);

    console.log({ tkns });

    const response = await axios.get(
      `https://services.leadconnectorhq.com/calendars/`,
      {
        params: {
          locationId: accountId, // This is correct, GHL expects locationId here
        },
        headers: {
          // Access token must be valid and not expired
          Authorization: `Bearer ${tkns.data.access_token}`,
          // Version 2021-04-15 is the standard for GHL API v2
          Version: "2021-04-15",
          Accept: "application/json",
        },
      },
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
    (sub) => sub.accountId === accountId && sub.connected,
  );

  if (!targetSubaccount)
    return res.send({
      status: false,
      message: "This subaccount does not exist!",
    });

  const targetAssistant = targetSubaccount.vapiAssistants.find(
    (target) => target.assistantId === assistantId,
  );

  if (!targetAssistant)
    return res.send({
      status: false,
      message: "This assistant does not exist!",
    });

  const tkns = await getSubGhlTokens(userId, accountId);

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    // url: `https://services.leadconnectorhq.com/calendars/${targetAssistant.calendar}`,
    url: `https://services.leadconnectorhq.com/calendars/${targetAssistant.calendar}`,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tkns.data.access_token}`,
      Version: "2021-04-15",
    },
  };

  axios
    .request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      return res.send({
        status: true,
        data: response.data || {},
      });
    })
    .catch((error) => {
      // console.log(error);
      return res.send({
        status: false,
        message: error.message || "This assistant does not exist!",
      });
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
      },
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
  const { assistantId } = req.query;

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some((ast) => ast.assistantId === assistantId),
    );

    if (!targetSubaccount)
      return res.send({ status: false, message: "Subaccount not found!" });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );

    if (!targetAssistant)
      return res.send({ status: false, message: "Assistant does not exist!" });

    const toolPromises = targetAssistant.connectedTools.map(
      (id) =>
        axios
          .get(`https://api.vapi.ai/tool/${id}`, {
            headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
          })
          .then((res) => res.data)
          .catch(() => null), // Handle deleted tools gracefully
    );

    const allTools = await Promise.all(toolPromises);

    // 3. Filter for Knowledge Base (Query) tools
    const connectedTools = allTools.filter(
      (tool) => tool && tool.type !== "query",
    );

    console.log(
      `Found ${connectedTools.length} knowledge base tools attached.`,
    );

    return res.send({
      status: true,
      data: connectedTools || [],
    });
  } catch (error) {
    // console.error("Failed to get knowledge bases:", error.message);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const addDynamicFMessageToDB = async (req, res) => {
  try {
    const userId = req.user;
    const { assistantId, message, type } = req.body;

    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some(
        (ast) => ast.assistantId === assistantId && sub.connected,
      ),
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    console.log(
      targetAssistant.inboundDynamicMessage,
      targetAssistant.outboundDynamicMessage,
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
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const getToolDetails = async (req, res) => {
  // const userId = req.user;
  const { toolId } = req.query;

  try {
    const response = await axios.get(`https://api.vapi.ai/tool/${toolId}`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Tool Details:", response.data);
    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      "Error fetching tool details:",
      error.response ? error.response.data : error.message,
    );
    return res.send({
      status: false,
      message: error.message,
      data: response.data,
    });
  }
};

const getFileDetails = async (req, res) => {
  const { fileId } = req.query;

  try {
    const response = await axios.get(`https://api.vapi.ai/file/${fileId}`, {
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("File Details:", response.data);
    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      "Error fetching file details:",
      error.response ? error.response.data : error.message,
    );
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const linkKnowledgeBaseToAssistant = async (req, res) => {
  const userId = req.user;
  const { assistantId, toolId } = req.body;
  try {
    const vapi = new VapiClient({
      token: VAPI_API_KEY,
    });

    const massistant = await vapi.assistants.get(assistantId);
    let updatedTools = [...(massistant.model.toolIds || [])];
    if (!updatedTools.includes(toolId) && toolId) {
      updatedTools.push(toolId);
    }

    // console.log({ massistant });

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        model: {
          provider: massistant.model.provider || "openai",
          model: massistant.model.model || "gpt-4o",
          ...massistant.model,
          toolIds: [...(updatedTools || [])],
        },
      },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      },
    );

    let foundAssistant;

    const user = await userModel.findById(userId);
    for (const sub of user.ghlSubAccountIds) {
      foundAssistant = sub.vapiAssistants.find(
        (a) => a.assistantId === assistantId,
      );
      if (foundAssistant) {
        console.log({ foundAssistant });
        if (!foundAssistant?.knowledgeBaseToolIds)
          foundAssistant.knowledgeBaseToolIds = [];
        const isAlreadyLinked =
          foundAssistant?.knowledgeBaseToolIds &&
          foundAssistant.knowledgeBaseToolIds.includes(toolId);
        if (!isAlreadyLinked) foundAssistant.knowledgeBaseToolIds.push(toolId);
        console.log({ isAlreadyLinked });
        break;
      }
    }
    user.markModified("ghlSubAccountIds");
    await user.save();

    // console.log(
    //   `Knowledge Base linked to Assistant ${assistantId}:`,
    //   response.data
    // );
    return res.send({
      status: true,
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error linking knowledge base:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      message: error.message,
      data: error.response?.data,
    });
  }
};

const getAllKnowledgeBases = async (req, res) => {
  const userId = req.user;

  try {
    const user = await userModel.findById(userId);

    const toolPromises = user.allKnowledgeBaseToolIds.map(
      (id) =>
        axios
          .get(`https://api.vapi.ai/tool/${id}`, {
            headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
          })
          .then((res) => res.data)
          .catch(() => null), // Handle deleted tools gracefully
    );

    const allTools = await Promise.all(toolPromises);

    const knowledgeBaseTools = allTools.filter(
      (tool) => tool && tool.type === "query",
    );

    return res.send({ status: true, data: knowledgeBaseTools || [] });
  } catch (error) {
    console.error(
      "Error fetching knowledge bases:",
      error.response ? error.response.data : error.message,
    );
    return res.send({
      status: false,
      message: error.message,
      data: error.response?.data,
    });
  }
};

const deleteAllFilesFromTool = async (toolId) => {
  try {
    // 1. Fetch the tool to get the list of linked files
    const toolResponse = await axios.get(`https://api.vapi.ai/tool/${toolId}`, {
      headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
    });

    const tool = toolResponse.data;

    // Check if it's a query tool with files
    if (tool.type === "query" && tool.knowledgeBases) {
      // Extract all file IDs from all knowledge base providers linked to this tool
      const fileIds = tool.knowledgeBases.flatMap((kb) => kb.fileIds || []);

      console.log(`Found ${fileIds.length} files to delete...`);

      // 2. Delete each file individually
      const deletePromises = fileIds.map((fileId) =>
        axios
          .delete(`https://api.vapi.ai/file/${fileId}`, {
            headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
          })
          .then(() => console.log(`Deleted file: ${fileId}`))
          .catch((err) =>
            console.error(`Failed to delete file ${fileId}:`, err.message),
          ),
      );

      // Wait for all file deletions to finish
      await Promise.all(deletePromises);

      console.log("All linked files have been processed.");
      return true;
    } else {
      console.log("This tool does not have any linked files.");
      throw Error("No linked files found for this tool.");
    }
  } catch (error) {
    console.error(
      "Error in cleanup process:",
      error.response?.data || error.message,
    );
    throw Error("Error in cleanup process:" + error.message);
  }
};

const removeToolFromAllAssistants = async (TARGET_TOOL_ID) => {
  try {
    // 1. Get the list of all assistants
    const { data: assistants } = await axios.get(
      "https://api.vapi.ai/assistant",
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      },
    );

    console.log(`Checking ${assistants.length} assistants...`);

    for (const assistant of assistants) {
      const toolIds = assistant.model?.toolIds || [];

      // 2. Check if this assistant uses the tool
      if (toolIds.includes(TARGET_TOOL_ID)) {
        console.log(
          `Removing tool from assistant: ${assistant.name} (${assistant.id})`,
        );

        // Filter out the target tool ID
        const updatedToolIds = toolIds.filter((id) => id !== TARGET_TOOL_ID);

        // 3. Update the assistant
        // NOTE: You must include provider/model to avoid "missing field" errors
        await axios.patch(
          `https://api.vapi.ai/assistant/${assistant.id}`,
          {
            model: {
              provider: assistant.model.provider,
              model: assistant.model.model,
              ...assistant.model,
              toolIds: updatedToolIds,
            },
          },
          {
            headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
          },
        );

        console.log(`Successfully updated ${assistant.name}`);
      }
    }

    console.log("Finished cleanup.");
    return true;
  } catch (error) {
    console.error(
      "Error during batch removal:",
      error.response?.data || error.message,
    );
    throw Error(error.message);
  }
};

const deleteKnowledgeBase = async (req, res) => {
  const { toolId } = req.query;
  const userId = req.user;

  // delete knowledge base tool from vapi
  // delete knowledge base tool id from database too (allKnowledgeBaseToolIds and knowledgeBaseToolIds)
  // delete linked files from vapi too

  console.log({ toolId });

  try {
    const removalStatus = await removeToolFromAllAssistants(toolId);
    console.log("tool assistants removal completed!");

    const deletionStatus = await deleteAllFilesFromTool(toolId);
    console.log("finished files deletion...");

    await axios.delete(`https://api.vapi.ai/tool/${toolId}`, {
      headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
    });

    // break knowledgebase linkage with assistant

    // delete knowledge base tool id from database too (allKnowledgeBaseToolIds and knowledgeBaseToolIds)
    await userModel.updateOne(
      { _id: userId },
      {
        $pull: {
          allKnowledgeBaseToolIds: toolId,
          "ghlSubAccountIds.$[].vapiAssistants.$[].knowledgeBaseToolIds":
            toolId,
        },
      },
    );

    console.log(`Knowledge base tool ${toolId} deleted successfully.`);

    return res.send({
      status: true,
      message: "Knowledge base deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Error deleting knowledge base:",
      error.response ? error.response.data : error.message,
    );
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const removeKnowledgeBaseFromAssistant = async (req, res) => {
  const userId = req.user;
  const { assistantId, toolId } = req.query;

  const vapi = new VapiClient({
    token: VAPI_API_KEY,
  });

  const massistant = await vapi.assistants.get(assistantId);

  try {
    const user = await userModel.findById(userId);
    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some(
        (ast) => ast.assistantId === assistantId && sub.connected,
      ),
    );

    if (!targetSubaccount) {
      return res.send({ status: false, message: "Subaccount not found!" });
    }

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );

    if (!targetAssistant) {
      return res.send({ status: false, message: "Assistant not found!" });
    }

    const remainingTools = massistant.model.toolIds.filter(
      (id) => id !== toolId,
    );

    const response = await axios.patch(
      `https://api.vapi.ai/assistant/${assistantId}`,
      {
        model: {
          provider: massistant.model.provider || "openai",
          model: massistant.model.model || "gpt-4o",
          ...massistant.model,
          toolIds: [...remainingTools],
        },
      },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      },
    );

    targetAssistant.knowledgeBaseToolIds = [...remainingTools];
    user.markModified("ghlSubAccountIds");
    await user.save();

    return res.send({
      status: true,
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Error removing knowledge base from assistant:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const addKnowledgeBase = async (req, res) => {
  const userId = req.user;
  const { knowledgeBaseUrl, type, title } = req.body;

  try {
    const user = await userModel.findById(userId);

    // const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
    //   sub.vapiAssistants.some(
    //     (ast) => ast.assistantId === assistantId && sub.connected
    //   )
    // );

    // if (!targetSubaccount)
    //   return res.send({ status: false, message: "Subaccount not found!" });

    // const targetAssistant = targetSubaccount.vapiAssistants.find(
    //   (target) => target.assistantId === assistantId
    // );

    // if (!targetAssistant)
    //   return res.send({ status: false, message: "Assistant does not exist!" });

    // get assistant model and provider, knowledge base requires it
    // const vapi = new VapiClient({
    //   token: VAPI_API_KEY,
    // });

    // const massistant = await vapi.assistants.get(assistantId);

    // console.log(
    //   `Successfully retrieved details for Assistant: ${massistant.name} (ID: ${massistant.id})`,
    //   massistant
    // );

    // if (!massistant) {
    //   return res.send({ status: false, message: "Assistant not found!" });
    // }

    // --- STEP 1: HARVEST DATA (Firecrawl API vs Local File) ---
    let fileBuffer;
    let fileName;

    if (type === "url") {
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
        },
      );

      if (!firecrawlRes.data.success) {
        throw new Error(
          `Firecrawl Error: ${firecrawlRes.data.error || "Unknown error"}`,
        );
      }

      // Firecrawl returns the data inside data.data.markdown
      fileBuffer = Buffer.from(firecrawlRes.data.data.markdown);
      fileName = `scraped_${Date.now()}.md`;
    } else if (type === "file") {
      if (!req.file) {
        return res.send({
          status: false,
          message: "No file provided",
        });
      }

      console.log("Processing local file...");

      const text = await extractText(req.file);

      // console.log("Extracted Text:", text);

      if (!text || text.trim().length < 50) {
        return res.send({
          status: false,
          message: "Extracted text is empty or too small",
        });
      }

      // const response = await axios.post(
      //   `https://api.vapi.ai/assistants/${assistantId}/knowledge-bases`,
      //   {
      //     model: { ...massistant.model },
      //     knowledgeBase: {
      //       type: "text",
      //       documents: [
      //         {
      //           title,
      //           content: text,
      //         },
      //       ],
      //     },
      //   },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${VAPI_API_KEY}`,
      //       "Content-Type": "application/json",
      //     },
      //     timeout: 30_000,
      //   }
      // );

      // console.log("Knowledge base added successfully:", response.data);

      fileBuffer = Buffer.from(text);
      fileName = `file_${Date.now()}.txt`;
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
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    const newFileId = uploadRes.data.id;

    console.log(`File uploaded to Vapi with File ID: ${newFileId}`);

    // console.log(
    //   `Linking Query Tool to Assistant ${assistantId}...`,
    //   massistant
    // );

    // console.log({
    //   model: massistant.model.model,
    //   provider: massistant.model.provider,
    // });

    // STEP 2: Create the Query Tool
    const toolResponse = await axios.post(
      "https://api.vapi.ai/tool",
      {
        type: "query",
        function: {
          name: "knowledge_search",
          description: "Searches the uploaded document for information.",
        },
        knowledgeBases: [
          {
            model: "gemini-2.5-pro",
            provider: "google", // only accepted value here
            name: fileName,
            description: title,
            fileIds: [newFileId],
          },
        ],
      },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      },
    );

    const toolId = toolResponse.data.id;

    console.log(`Query Tool created with ID: ${toolId}`);

    // console.log(`Query Tool ${toolId} linked to Assistant ${assistantId}`);

    // Save knowledge base file ID to database
    // if (!targetAssistant.knowledgeBaseToolIds) {
    //   targetAssistant.knowledgeBaseToolIds = [];
    // }
    // targetAssistant.knowledgeBaseToolIds.push(toolId);
    // user.markModified("ghlSubAccountIds");
    // await user.save();

    user.allKnowledgeBaseToolIds.push(toolId);
    user.markModified("ghlSubAccountIds");
    await user.save();

    // console.log(
    //   `Knowledge base added and linked successfully to Assistant ${assistantId}.`
    // );

    return res.send({ status: true, data: toolResponse.data });
  } catch (error) {
    console.error(
      "Failed to add knowledge base:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const getAssistantKnowledgeBases = async (req, res) => {
  const userId = req.user;
  const { assistantId } = req.query;

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find((sub) =>
      sub.vapiAssistants.some((ast) => ast.assistantId === assistantId),
    );

    if (!targetSubaccount)
      return res.send({ status: false, message: "Subaccount not found!" });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );

    if (!targetAssistant)
      return res.send({ status: false, message: "Assistant does not exist!" });

    const toolPromises = targetAssistant.knowledgeBaseToolIds.map(
      (id) =>
        axios
          .get(`https://api.vapi.ai/tool/${id}`, {
            headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
          })
          .then((res) => res.data)
          .catch(() => null), // Handle deleted tools gracefully
    );

    const allTools = await Promise.all(toolPromises);

    // 3. Filter for Knowledge Base (Query) tools
    const knowledgeBaseTools = allTools.filter(
      (tool) => tool && tool.type === "query",
    );

    console.log(
      `Found ${knowledgeBaseTools.length} knowledge base tools attached.`,
    );

    return res.send({
      status: true,
      data: knowledgeBaseTools || [],
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
  // const { assistantIds } = req.body; // Expecting ["id1", "id2"]
  const userId = req.user;

  const user = await userModel.findById(userId);

  const validAssistantIds = user.ghlSubAccountIds.flatMap((subAccount) =>
    subAccount.vapiAssistants.map((assistant) => assistant.assistantId),
  );

  const assistantIds = validAssistantIds;

  console.log("Fetching call logs for Assistant IDs:", assistantIds);

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
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      }),
    );

    // 2. Execute all requests in parallel
    const responses = await Promise.all(callRequests);

    // 3. Extract data and flatten the multiple arrays into one
    const allCalls = responses.flatMap((response) => response.data);

    // 4. Sort by creation date (newest first)
    const sortedCalls = allCalls.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
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
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      message: "Failed to retrieve call logs",
      error: error.response?.data || error.message,
    });
  }
};

const getAssistantFullReport = async (req, res) => {
  // const { assistantIds } = req.query;
  const userId = req.user;
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

  const user = await userModel.findById(userId);
  const assistantIds = user.ghlSubAccountIds.flatMap((subAccount) =>
    subAccount.vapiAssistants.map((assistant) => assistant.assistantId),
  );

  const phoneNumbers = user.ghlSubAccountIds.flatMap((subAccount) =>
    subAccount.vapiAssistants.flatMap((assistant) =>
      assistant.numberDetails.map((detail) => ({
        phoneNum: detail.phoneNum,
        phoneSid: detail.phoneSid,
      })),
    ),
  );

  console.log({ assistantIds, phoneNumbers });

  try {
    const reportPromises = assistantIds.map(async (id) => {
      // 1. Parallel fetch for Voice Calls and Text Messages/Chats
      const [callsRes] = await Promise.all([
        axios.get(`https://api.vapi.ai/call`, {
          params: { assistantId: id, limit: 1000 },
          headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
        }),
        // axios.get(`https://api.vapi.ai/message`, {
        //   params: { assistantId: id, limit: 1000 },
        //   headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
        // }),
      ]);

      const calls = callsRes.data;

      console.log({ calls });

      if (!calls.length) {
        // console.log(
        //   "Request worked, but no calls matched the Phone Number and Status."
        // );
        throw Error(
          "Request worked, but no calls matched the Phone Number and Status.",
        );
        // return res.send({ status: true, data: calls });
      }

      const voiceData = callsRes.data;
      const textData = callsRes.data;

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
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
        {
          params: {
            To: num.phoneNum,
            Status: "completed",
          },
          // Twilio requires Basic Auth, NOT Bearer
          auth: {
            username: TWILIO_ACCOUNT_SID,
            password: TWILIO_AUTH_TOKEN,
          },
        },
      );

      // B. Fetch Monthly Lease (MRC)
      // Endpoint: https://api.twilio.com/2010-04-01/Accounts/{Sid}/IncomingPhoneNumbers.json
      const numbersRes = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
        {
          params: {
            PhoneNumber: num.phoneNum, // Ensure this is formatted like '+12223334444'
          },
          // Switch from Headers to 'auth' object
          auth: {
            username: TWILIO_ACCOUNT_SID,
            password: TWILIO_AUTH_TOKEN,
          },
        },
      );

      console.log({ numbersRes, callsRes });

      const usageCost = (callsRes.data.calls || []).reduce(
        (acc, c) => acc + Math.abs(parseFloat(c.price || 0)),
        0,
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

    try {
      const [assistantReport, twilioReport] = await Promise.all([
        reportPromises,
        twilioReportPromises,
      ]);
    } catch (error) {
      throw Error(error.message);
    }
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
        (ast) => ast.assistantId === assistantId && sub.connected,
      ),
    );

    if (!targetSubaccount)
      return res.send({ status: false, message: "Subaccount not found!" });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );
    const targetPhoneNumber = targetAssistant.numberDetails.find(
      (number) => number.phoneNum === fromNumber,
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

    const outboundDynamicMessage = targetAssistant.outboundDynamicMessage || "";

    console.log({ outboundDynamicMessage, dynamicValues });

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
          firstMessage: message,
          firstMessageMode: message
            ? "assistant-speaks-first"
            : "assistant-speaks-first-with-model-generated-message",
        },
      },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
      },
    );

    console.log(
      `Outbound call initiated from ${fromNumber} to ${customerNumber} via Assistant ${assistantId}.`,
    );

    return res.send({ status: true, data: response.data });
  } catch (error) {
    console.error(
      "Failed to initiate outbound call:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      data: error.response?.data,
      message: error.message,
    });
  }
};

const checkWalletBalance = async (req, res) => {
  const userId = req.user;
  const user = await userModel.findById(userId);
  return res.send({ status: true, data: user.walletBalance });
};

const sendChatMessage = async (req, res) => {
  const { userText, assistantId } = req.body;
  const userId = req.user;

  const user = await userModel.findById(userId);

  content = "Wallet balance is too low. Please top up to continue.";

  if (user.walletBalance <= 0) {
    req.session.chatHistory[assistantId].push({
      role: "assistant",
      content,
    });
    return res.send({ status: false, reply: content });
  }

  if (!req.session.chatHistory) {
    req.session.chatHistory = {};
  }
  if (!req.session.chatHistory[assistantId]) {
    req.session.chatHistory[assistantId] = [];
  }

  try {
    const currentHistory = req.session.chatHistory[assistantId];
    const messages = [
      ...currentHistory.slice(-10),
      { role: "user", content: userText },
    ];

    console.log("Sending messages to Vapi:", messages);

    const response = await axios.post(
      "https://api.vapi.ai/chat", // Corrected Endpoint
      {
        assistantId: assistantId, // Passed in the body
        input: messages, // Vapi expects 'input' or 'messages'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const amountToDeduct = response.data.cost || 0;
    const type = "chat_message";

    user.walletBalance -= amountToDeduct;
    await user.save();

    user.billingEvents.push({
      callId: response.data.id,
      type,
      amount: amountToDeduct,
    });

    console.log("Received response from Vapi:", response.data);

    req.session.chatHistory[assistantId].push({
      role: "user",
      content: userText,
    });
    req.session.chatHistory[assistantId].push(response.data.output[0]);

    return res.send({ status: true, reply: response.data.output });
  } catch (error) {
    console.error(
      "Error sending chat message:",
      error.response ? error.response.data : error.message,
    );
    return res.send({
      status: false,
      message: error.message,
      data: error.response?.data,
    });
  }
};

const getContacts = async (req, res) => {
  const userId = req.user;
  try {
    const user = await userModel.findById(userId);
    const contacts = user.ghlSubAccountIds
      .map((acc) => acc.savedContacts)
      .flat(); // assuming first subaccount for simplicity

    return res.send({ status: true, data: contacts });
  } catch (error) {
    console.error(
      "Error fetching Vapi contacts:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      message: error.response?.data || error.message,
    });
  }
};

const createContact = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId } = req.query;
    const contactData = req.body;

    const user = await userModel.findById(userId);

    user.ghlSubAccountIds
      .find((subaccount) => subaccount.accountId === subaccountId)
      .savedContacts.push(contactData);

    await user.save();

    return res.send({ status: true, message: "Contact created successfully." });
  } catch (error) {
    console.error(
      "Error creating Vapi contact:",
      error.response?.data || error.message,
    );
    return {
      status: false,
      message: error.response?.data || error.message,
    };
  }
};

const deleteContact = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, contactId } = req.query;

    const user = await userModel.findById(userId);

    const subaccount = user.ghlSubAccountIds.find(
      (subaccount) => subaccount.accountId === subaccountId,
    );

    if (!subaccount) {
      return res
        .status(404)
        .send({ status: false, message: "Subaccount not found." });
    }

    subaccount.savedContacts = subaccount.savedContacts.filter(
      (contact) => contact._id != contactId,
    );

    await user.save();

    return res.send({ status: true, message: "Contact deleted successfully." });
  } catch (error) {
    console.error(
      "Error deleting Vapi contact:",
      error.response?.data || error.message,
    );
    return {
      status: false,
      message: error.response?.data || error.message,
    };
  }
};

const updateContact = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, contactId } = req.query;
    const updatedData = req.body;

    const user = await userModel.findById(userId);

    // 1. Find the subaccount
    const subaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId,
    );

    if (!subaccount) {
      return res.send({ status: false, message: "Subaccount not found." });
    }

    // 2. Find the specific contact subdocument
    const contact = subaccount.savedContacts.id(contactId);

    if (!contact) {
      return res.send({ status: false, message: "Contact not found." });
    }

    if (!Object.keys(updatedData).length) {
      return res
        .status(400)
        .send({ status: false, message: "No data provided." });
    }

    // 3. Update the data using .set()
    contact.set(updatedData);

    // 4. Save the parent document
    await user.save();

    return res.send({
      status: true,
      message: "Contact updated successfully.",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error.message);
    return res.send({ status: false, message: error.message });
  }
};

const getContact = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, contactId } = req.query;

    const user = await userModel.findById(userId);

    const subaccount = user.ghlSubAccountIds.find(
      (subaccount) => subaccount.accountId === subaccountId,
    );

    if (!subaccount) {
      return res.send({ status: false, message: "Subaccount not found." });
    }

    const contact = subaccount.savedContacts.find(
      (contact) => contact._id == contactId,
    );

    if (!contact) {
      return res.send({ status: false, message: "Contact not found." });
    }

    return res.send({ status: true, data: contact });
  } catch (error) {
    console.error(
      "Error fetching Vapi contact:",
      error.response?.data || error.message,
    );
    return res.send({
      status: false,
      message: error.response?.data || error.message,
    });
  }
};

const getTeamNotes = async (req, res) => {
  const userId = req.user;
  const { subaccountId, assistantId } = req.query;

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected,
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    return res.send({
      status: true,
      data: {
        teamNotes: targetAssistant.teamNotes || "",
      },
    });
  } catch (error) {
    console.error("Error fetching team notes:", error);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const updateTeamNotes = async (req, res) => {
  const userId = req.user;
  const { subaccountId, assistantId, teamNotes } = req.body;

  if (!teamNotes && teamNotes !== "") {
    return res.send({
      status: false,
      message: "teamNotes field is required",
    });
  }

  try {
    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.find(
      (sub) => sub.accountId === subaccountId && sub.connected,
    );

    if (!targetSubaccount)
      return res.send({
        status: false,
        message: "This subaccount does not exist!",
      });

    const targetAssistant = targetSubaccount.vapiAssistants.find(
      (target) => target.assistantId === assistantId,
    );

    if (!targetAssistant)
      return res.send({
        status: false,
        message: "This assistant does not exist!",
      });

    // Update team notes
    targetAssistant.teamNotes = teamNotes;

    user.markModified("ghlSubAccountIds");
    await user.save();

    return res.send({
      status: true,
      message: "Team notes updated successfully.",
      data: {
        teamNotes: targetAssistant.teamNotes,
      },
    });
  } catch (error) {
    console.error("Error updating team notes:", error);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

// Execute the main function
module.exports = {
  createAssistantAndSave,
  getAssistant,
  getAssistants,
  updateAssistant,
  deleteAssistant,
  generatePrompt,
  deleteNumberFromAssistant,
  executeToolFromVapi,
  getVapiPhoneId,
  addATool,
  deleteAssistantTool,
  addCalendarId,
  getAssistantTools,
  addDynamicFMessageToDB,
  addKnowledgeBase,
  getAssistantKnowledgeBases,
  getAssistantCallLogs,
  getAssistantFullReport,
  makeOutboundCall,
  getAvailableCalendars,
  getConnectedCalendar,
  generateOutBoundCallUrl,
  getDynamicFMessage,
  getToolDetails,
  getFileDetails,
  getAllKnowledgeBases,
  linkKnowledgeBaseToAssistant,
  deleteKnowledgeBase,
  removeKnowledgeBaseFromAssistant,
  sendChatMessage,
  checkWalletBalance,
  getContacts,
  createContact,
  deleteContact,
  updateContact,
  getContact,
  getUserAnalytics,
  getTeamNotes,
  updateTeamNotes,
};

// what's left
// tools (done)
// inbound and outbound call handling (done)
// apis to be called when a tool is called (done)
// assistant call logs and reports (how much was charged)
// payments charging (done)
// testing
// whitelabel
