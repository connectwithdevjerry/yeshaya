// url paths
const USER = "/user";
const USER_SIGNUP = "/signup";
const USER_SIGNIN = "/signin";
const USER_FORGOT_PASS = "/forgot_password";
const USER_RESET_PASS = "/reset_password";
const USER_LOGOUT = "/logout";
const ACTIVATE = "/activate/:token";
const GET_REFRESH = "/get_access";
const GET_USERS = "/get_users";

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
  GET_REFRESH,
  GET_USERS,
  REFRESH_TOKEN,
};
