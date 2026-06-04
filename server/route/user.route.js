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
  updateUserProfile,
  getDomainSettings,
  saveDomainSettings,
  verifyDomain,
  getSnapshot,
  saveSnapshot,
  getAdminSettings,
  saveAdminSettings,
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
  UPDATE_USER_PROFILE,
  GET_DOMAIN_SETTINGS,
  SAVE_DOMAIN_SETTINGS,
  VERIFY_DOMAIN,
  GET_SNAPSHOT,
  SAVE_SNAPSHOT,
  GET_ADMIN_SETTINGS,
  SAVE_ADMIN_SETTINGS,
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
router.get(GET_USER_DETAILS,     verifyAccessToken, getUserDetails);
router.put(UPDATE_USER_PROFILE,  (req, res, next) => {
  console.log("📥 PUT /auth/update-profile hit — auth header present:", !!req.headers["authorization"]);
  next();
}, verifyAccessToken, updateUserProfile);
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

// Domain settings
router.get(GET_DOMAIN_SETTINGS,  verifyAccessToken, getDomainSettings);
router.post(SAVE_DOMAIN_SETTINGS, verifyAccessToken, saveDomainSettings);
router.post(VERIFY_DOMAIN,        verifyAccessToken, verifyDomain);

// Snapshot settings
router.get(GET_SNAPSHOT,  verifyAccessToken, getSnapshot);
router.post(SAVE_SNAPSHOT, verifyAccessToken, saveSnapshot);

// Admin settings
router.get(GET_ADMIN_SETTINGS,  verifyAccessToken, getAdminSettings);
router.post(SAVE_ADMIN_SETTINGS, verifyAccessToken, saveAdminSettings);

module.exports = router;
