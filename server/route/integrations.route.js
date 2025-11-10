const express = require("express");
const router = express.Router();
const {
  ghlAuthorize,
  ghlOauthCallback,
  testOpenAIKey,
  stripeOauthCallback,
  stripeAuthorize,
  testStripeToken,
  connectOpenAI,
  chargeUserCustomers,
  importGhlSubaccounts,
  importGhlSubaccount,
  callGetSubaccounts,
  checkIntegrationStatus,
  getAvailableNumbers,
  buyUsPhoneNumber,
  twilioCallReceiver,
  twilioSmsReceiver,
  importTwilioNumberToVapi,
  getPurchasedNumbers,
  // admin_super_signup,
} = require("../controller/integrations.controller");
const { verifyAccessToken } = require("../jwt_helpers");

const {
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
  GET_GHL_SUB_ACCOUNTS,
  CHECK_INTEGRATION_STATUS,
  GET_AVAILABLE_NUMBERS,
  BUY_NUMBER,
  TWILIO_CALL_RECEIVER,
  TWILIO_SMS_RECEIVER,
  IMPORT_PHONE_NUM_TO_VAPI,
  GET_PURCHASED_NUMBER,
} = require("../constants");

router.get(GHL_AUTHORIZE, verifyAccessToken, ghlAuthorize);
router.get(GHL_OAUTH_CALLBACK, ghlOauthCallback);
router.get(STRIPE_AUTHORIZE, verifyAccessToken, stripeAuthorize);
router.get(STRIPE_OAUTH_CALLBACK, stripeOauthCallback);
router.get(TEST_OPENAI_KEY, verifyAccessToken, testOpenAIKey);
router.post(CONNECT_OPENAI, verifyAccessToken, connectOpenAI);
router.get(TEST_STRIPE_TOKEN, verifyAccessToken, testStripeToken);
router.post(CHARGE_CUSTOMER, verifyAccessToken, chargeUserCustomers);
router.post(IMPORT_GHL_SUB_ACCOUNT, verifyAccessToken, importGhlSubaccount);
router.post(IMPORT_GHL_SUB_ACCOUNTS, verifyAccessToken, importGhlSubaccounts);
router.get(GET_GHL_SUB_ACCOUNTS, verifyAccessToken, callGetSubaccounts);
router.get(CHECK_INTEGRATION_STATUS, verifyAccessToken, checkIntegrationStatus);
router.get(GET_AVAILABLE_NUMBERS, verifyAccessToken, getAvailableNumbers);
router.post(BUY_NUMBER, verifyAccessToken, buyUsPhoneNumber);
router.post(TWILIO_CALL_RECEIVER, twilioCallReceiver);
router.post(TWILIO_SMS_RECEIVER, twilioSmsReceiver);
router.post(
  IMPORT_PHONE_NUM_TO_VAPI,
  verifyAccessToken,
  importTwilioNumberToVapi
);
router.get(GET_PURCHASED_NUMBER, verifyAccessToken, getPurchasedNumbers);

module.exports = router;
