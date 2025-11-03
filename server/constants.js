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

// cookie constants
const REFRESH_TOKEN = "refreshToken";

module.exports = {
  USER,
  USER_SIGNUP,
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
  GET_ASSISTANT,
  GET_ASSISTANTS,
  UPDATE_ASSISTANT,
  GENERATE_PROMPT,
  GET_GHL_SUB_ACCOUNTS,
};
