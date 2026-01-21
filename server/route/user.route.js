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
  updateCompanyDetails,
  getUserDetails,
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
  UPDATE_COMPANY_DETAILS,
  GET_USER_DETAILS,
} = require("../constants");
const { verifyAccessToken } = require("../jwt_helpers");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post(USER_SIGNUP, signup);
router.post(USER_SIGNIN, signin);
router.get(ACTIVATE, activateUser);
router.post(USER_FORGOT_PASS, forgotPassword);
router.post(USER_RESET_PASS, handleResetPassword);
router.delete(USER_LOGOUT, logout);
router.post(EXCHANGE_TOKEN, exchangeToken);
router.get(GET_COMPANY_DETAILS, verifyAccessToken, getCompanyDetails);
router.get(GET_USER_DETAILS, verifyAccessToken, getUserDetails);
router.post(
  REGISTER_COMPANY,
  verifyAccessToken,
  upload.single("logo"),
  createCompanyDetails,
);
router.post(
  UPDATE_COMPANY_DETAILS,
  verifyAccessToken,
  upload.single("logo"),
  updateCompanyDetails,
);

module.exports = router;
