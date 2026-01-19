// url paths
const USER = "/user";
const USER_SIGNUP = "/signup";
const USER_SIGNIN = "/signin";
const USER_FORGOT_PASS = "/forgot_password";
const USER_RESET_PASS = "/reset_password";
const USER_LOGOUT = "/logout";
const ACTIVATE = "/activate/:token";
const EXCHANGE_TOKEN = "/exchange-token";
const GET_USERS = "/get_users";
const GHL_AUTHORIZE = "/ghl/authorize";
const GHL_OAUTH_CALLBACK = "/oauth/callback";
const STRIPE_AUTHORIZE = "/stripe/authorize";
const STRIPE_OAUTH_CALLBACK = "/payment/oauth/callback";
const GHL_SUB_AUTHORIZE = "/sub/ghl/authorize";
const GHL_SUB_OAUTH_CALLBACK = "/sub/oauth/callback";
const TEST_OPENAI_KEY = "/test/openai-key";
const CONNECT_OPENAI = "/connect/openai";
const TEST_STRIPE_TOKEN = "/test/stripe-token";
const CHARGE_CUSTOMER = "/charge-connected-account";
const IMPORT_GHL_SUB_ACCOUNTS = "/import-sub-accounts";
const IMPORT_GHL_SUB_ACCOUNT = "/import-sub-account";
const CREATE_ASSISTANT = "/create";
const DELETE_ASSISTANT = "/delete";
const GET_ASSISTANT = "/get";
const GET_ASSISTANTS = "/get-all";
const UPDATE_ASSISTANT = "/update";
const GENERATE_PROMPT = "/generate-prompt";
const GET_GHL_SUB_ACCOUNTS = "/get-subaccounts";
const CHECK_INTEGRATION_STATUS = "/status";
const GET_AVAILABLE_NUMBERS = "/get-available-phone-numbers";
const BUY_NUMBER = "/buy-number";
const TWILIO_CALL_RECEIVER = "/voiceurl/:userId/:subaccount/:assistant";
const TWILIO_SMS_RECEIVER = "/smsurl/:userId/:subaccount/:assistant";
const IMPORT_PHONE_NUM_TO_VAPI = "/import-number-to-vapi";
const GET_PURCHASED_NUMBER = "/purchased-numbers";
const GET_COMPANY_DETAILS = "/company-details";
const REGISTER_COMPANY = "/register-company";
const GET_VAPI_NUMBER_IMPORT_STATUS = "/vapi-number-import-status";
const DELETE_NUM_FROM_VAPI = "/delete-number-from-vapi";
const STRIPE_WEBHOOK = "/stripe/webhook";
const ADD_TOOL = "/add-tool";
const DELETE_TOOL = "/delete-tool";
const ADD_CALENDAR = "/add-calendar";
const GET_TOOLS = "/get-tools";
const EXECUTE_TOOL = "/execute-tool/:userId";
const ADD_DYNAMIC_MESSAGE = "/add-dynamic-message";
const GET_DYNAMIC_MESSAGE = "/get-dynamic-message";
const ADD_KNOWLEDGE_BASES = "/add-knowledge-bases";
const GET_KNOWLEDGE_BASES = "/get-knowledge-bases";
const GET_ASSISTANT_CALL_LOGS = "/get-assistant-call-logs";
const GET_FULL_REPORT = "/get-full-report";
const MAKE_OUTBOUND_CALL = "/make-outbound-call";
const GET_AVAILABLE_GHL_CALENDARS = "/get-available-ghl-calendars";
const GET_CONNECTED_CALENDARS = "/get-connected-calendar";
const DELETE_TWILIO_NUMBER = "/delete-twilio-number";
const CALL_BILLING_WEBHOOK = "/billing/webhook";
const GET_TOOL_DETAILS = "/get-tool-details";
const GET_FILE_DETAILS = "/get-file-details";
const GENERATE_OUTBOUND_CALL_URL = "/generate-outbound-call-url";
const GET_ASSISTANT_KNOWLEDGE_BASES = "/get-assistant-knowledge-bases";
const LINK_KNOWLEDGE_BASES_2_ASSISTANT = "/link-knowledge-bases-to-assistant";
const GET_ALL_KNOWLEDGE_BASES = "/get-all-knowledge-bases";
const RMV_ASSISTANT_KNOWLEDGE = "/remove-knowlege-base-from-assistant";
const DELETE_KNOWLEDGE_BASE = "/delete-knowlege-base";
const SEND_CHAT_MESSAGE = "/send-chat-message";
const GET_WALLET_BALANCE = "/get-wallet-balance";
// cookie constants
const REFRESH_TOKEN = "refreshToken";

module.exports = {
  USER,
  USER_SIGNUP,
  STRIPE_WEBHOOK,
  USER_SIGNIN,
  USER_FORGOT_PASS,
  USER_RESET_PASS,
  USER_LOGOUT,
  ACTIVATE,
  EXCHANGE_TOKEN,
  GET_USERS,
  REFRESH_TOKEN,
  GHL_AUTHORIZE,
  GHL_OAUTH_CALLBACK,
  GHL_SUB_AUTHORIZE,
  GHL_SUB_OAUTH_CALLBACK,
  TEST_OPENAI_KEY,
  STRIPE_AUTHORIZE,
  STRIPE_OAUTH_CALLBACK,
  TEST_STRIPE_TOKEN,
  CONNECT_OPENAI,
  CHARGE_CUSTOMER,
  IMPORT_GHL_SUB_ACCOUNTS,
  IMPORT_GHL_SUB_ACCOUNT,
  CREATE_ASSISTANT,
  DELETE_ASSISTANT,
  GET_VAPI_NUMBER_IMPORT_STATUS,
  GET_ASSISTANT,
  GET_ASSISTANTS,
  UPDATE_ASSISTANT,
  GENERATE_PROMPT,
  GET_GHL_SUB_ACCOUNTS,
  CHECK_INTEGRATION_STATUS,
  GET_AVAILABLE_NUMBERS,
  BUY_NUMBER,
  TWILIO_CALL_RECEIVER,
  TWILIO_SMS_RECEIVER,
  IMPORT_PHONE_NUM_TO_VAPI,
  GET_PURCHASED_NUMBER,
  GET_COMPANY_DETAILS,
  REGISTER_COMPANY,
  DELETE_NUM_FROM_VAPI,
  ADD_TOOL,
  DELETE_TOOL,
  ADD_CALENDAR,
  GET_TOOLS,
  ADD_DYNAMIC_MESSAGE,
  GET_DYNAMIC_MESSAGE,
  ADD_KNOWLEDGE_BASES,
  GET_KNOWLEDGE_BASES,
  GET_ASSISTANT_CALL_LOGS,
  GET_FULL_REPORT,
  MAKE_OUTBOUND_CALL,
  GET_AVAILABLE_GHL_CALENDARS,
  GET_WALLET_BALANCE,
  GET_CONNECTED_CALENDARS,
  DELETE_TWILIO_NUMBER,
  CALL_BILLING_WEBHOOK,
  GENERATE_OUTBOUND_CALL_URL,
  GET_TOOL_DETAILS,
  GET_FILE_DETAILS,
  GET_ASSISTANT_KNOWLEDGE_BASES,
  GET_ALL_KNOWLEDGE_BASES,
  LINK_KNOWLEDGE_BASES_2_ASSISTANT,
  RMV_ASSISTANT_KNOWLEDGE,
  DELETE_KNOWLEDGE_BASE,
  EXECUTE_TOOL,
  SEND_CHAT_MESSAGE,
};
