const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  logout,
  forgotPassword,
  handleResetPassword,
  activateUser,
  exchangeToken,
  getCompanyDetails,
  createCompanyDetails,
  // admin_super_signup,
} = require("../controller/user.controller");
const {
  USER_SIGNUP,
  USER_SIGNIN,
  USER_FORGOT_PASS,
  USER_RESET_PASS,
  USER_LOGOUT,
  ACTIVATE,
  EXCHANGE_TOKEN,
  GET_COMPANY_DETAILS,
  REGISTER_COMPANY,
} = require("../constants");
const { verifyAccessToken } = require("../jwt_helpers");

router.post(USER_SIGNUP, signup);
router.post(USER_SIGNIN, signin);
router.get(ACTIVATE, activateUser);
router.post(USER_FORGOT_PASS, forgotPassword);
router.post(USER_RESET_PASS, handleResetPassword);
router.delete(USER_LOGOUT, logout);
router.post(EXCHANGE_TOKEN, exchangeToken);
router.get(GET_COMPANY_DETAILS, verifyAccessToken, getCompanyDetails);
router.post(REGISTER_COMPANY, verifyAccessToken, createCompanyDetails);

module.exports = router;
