const axios = require("axios");
const userModel = require("../model/user.model");
const { OpenAI } = require("openai");
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const { VapiClient } = require("@vapi-ai/server-sdk");

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
  const userId = req.user;
  const { description } = req.query;

  const openai = new OpenAI();

  return res.send({ status: true });
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
  const { phoneNum } = req.query;

  console.log({ phoneNum });

  const getPhoneNumId = await getVapiPhoneId(phoneNum);

  if (!getPhoneNumId.status) {
    return res.send({
      status: false,
      message: getPhoneNumId.message,
    });
  }

  const phoneNumId = getPhoneNumId.vapiPhoneNumId;

  const url = `https://api.vapi.ai/phone-number/${phoneNumId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log(`Successfully deleted Vapi Phone Number ID: ${phoneNumId}`);
      // A successful DELETE usually returns 200 OK or 204 No Content.
      return res.send({
        status: true,
        message: "Phone number deleted successfully.",
      });
    } else {
      const errorBody = await response.json();
      console.error(
        `Failed to delete Vapi Phone Number. Status: ${response.status}`,
        errorBody
      );
      return res.send({
        status: false,
        message: "Failed to delete phone number.",
        details: errorBody,
      });
    }
  } catch (error) {
    console.error("An error occurred during the DELETE request:", error);
    return res.send({
      status: false,
      message: "An error occurred during the DELETE request.",
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
};
