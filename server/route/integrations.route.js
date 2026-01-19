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
  getVapiNumberImportStatus,
  deleteTwilioNumber,
  ghlSubAuthorize,
  ghlSubOauthCallback,
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
  GET_VAPI_NUMBER_IMPORT_STATUS,
  STRIPE_WEBHOOK,
  DELETE_TWILIO_NUMBER,
  CALL_BILLING_WEBHOOK,
  GHL_SUB_AUTHORIZE,
  GHL_SUB_OAUTH_CALLBACK,
  CONFIRM_PAYMENT,
} = require("../constants");
const {
  stripeWebhook,
  callBillingWebhook,
  paymentConfirmation,
  chargeCustomerCard,
} = require("../controller/payments.controller");

router.post(TWILIO_CALL_RECEIVER, twilioCallReceiver);
router.post(TWILIO_SMS_RECEIVER, twilioSmsReceiver);
router.get(GHL_AUTHORIZE, verifyAccessToken, ghlAuthorize);
router.get(GHL_OAUTH_CALLBACK, ghlOauthCallback);
router.get(GHL_SUB_AUTHORIZE, verifyAccessToken, ghlSubAuthorize);
router.get(GHL_SUB_OAUTH_CALLBACK, ghlSubOauthCallback);
router.get(STRIPE_AUTHORIZE, verifyAccessToken, stripeAuthorize);
router.post(CONFIRM_PAYMENT, verifyAccessToken, paymentConfirmation);
router.get(STRIPE_OAUTH_CALLBACK, stripeOauthCallback);
router.post(
  STRIPE_WEBHOOK,
  express.raw({ type: "application/json" }),
  stripeWebhook,
);
router.get(TEST_OPENAI_KEY, verifyAccessToken, testOpenAIKey);
router.post(CONNECT_OPENAI, verifyAccessToken, connectOpenAI);
router.get(TEST_STRIPE_TOKEN, verifyAccessToken, testStripeToken);
router.post(CHARGE_CUSTOMER, verifyAccessToken, chargeCustomerCard);
router.post(IMPORT_GHL_SUB_ACCOUNT, verifyAccessToken, importGhlSubaccount);
router.post(IMPORT_GHL_SUB_ACCOUNTS, verifyAccessToken, importGhlSubaccounts);
router.get(GET_GHL_SUB_ACCOUNTS, verifyAccessToken, callGetSubaccounts);
router.get(CHECK_INTEGRATION_STATUS, verifyAccessToken, checkIntegrationStatus);
router.get(GET_AVAILABLE_NUMBERS, verifyAccessToken, getAvailableNumbers);
router.post(BUY_NUMBER, verifyAccessToken, buyUsPhoneNumber);
router.post(
  IMPORT_PHONE_NUM_TO_VAPI,
  verifyAccessToken,
  importTwilioNumberToVapi,
);
router.get(
  GET_VAPI_NUMBER_IMPORT_STATUS,
  verifyAccessToken,
  getVapiNumberImportStatus,
);
router.get(GET_PURCHASED_NUMBER, verifyAccessToken, getPurchasedNumbers);
router.get(DELETE_TWILIO_NUMBER, verifyAccessToken, deleteTwilioNumber);

// router for payments integration
router.post(CALL_BILLING_WEBHOOK, express.json(), callBillingWebhook);

module.exports = router;
