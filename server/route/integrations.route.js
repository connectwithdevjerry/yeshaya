const express = require("express");
const router = express.Router();
const {
  ghlAuthorize,
  ghlOauthCallback,
  getNumberSettings,
  saveNumberSettings,
  getWebhookConfig,
  saveWebhookConfig,
  testWebhook,
  importByoNumber,
  getByoNumbers,
  reassignNumberAssistant,
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
  deleteSubAccount,
  toggleSubAccountFavorite,
  toggleSubAccountArchive,
  updateSubAccountMeta,
  getSubAccountDetails,
  disconnectGoHighLevel,
  disconnectOpenAI,
  disconnectStripe,
  ghlSubAuthorize,
  ghlSubOauthCallback,
} = require("../controller/integrations.controller");
const { verifyAccessToken, requireRole } = require("../jwt_helpers");

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
  GET_TRANSACTION_HISTORY,
  DELETE_TWILIO_NUMBER,
  CALL_BILLING_WEBHOOK,
  GHL_SUB_AUTHORIZE,
  GHL_SUB_OAUTH_CALLBACK,
  CONFIRM_PAYMENT,
  GET_CHARGING_DETAILS,
  UPDATE_CHARGING_DETAILS,
  AUTO_CARD_PAY_WEBHOOK,
  DELETE_SUBACCOUNT,
  TOGGLE_SUBACCOUNT_FAVORITE,
  TOGGLE_SUBACCOUNT_ARCHIVE,
  UPDATE_SUBACCOUNT_META,
  GET_SUBACCOUNT_DETAILS,
  GET_STRIPE_PORTAL,
  DISCONNECT_GHL,
  DISCONNECT_OPENAI,
  DISCONNECT_STRIPE,
} = require("../constants");
const {
  stripeWebhook,
  callBillingWebhook,
  paymentConfirmation,
  chargeCustomerCard,
  getTransactionHistory,
  getChargingDetails,
  updateAutoChargingSettings,
  autoTopUpLowWalletUsers,
  getStripePortalLink,
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
router.get(GET_TRANSACTION_HISTORY, verifyAccessToken, getTransactionHistory);
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
router.delete(DELETE_SUBACCOUNT,           verifyAccessToken, requireRole("owner", "admin"), deleteSubAccount);
router.put(TOGGLE_SUBACCOUNT_FAVORITE,     verifyAccessToken, toggleSubAccountFavorite);
router.put(TOGGLE_SUBACCOUNT_ARCHIVE,      verifyAccessToken, toggleSubAccountArchive);
router.put(UPDATE_SUBACCOUNT_META,         verifyAccessToken, updateSubAccountMeta);
router.get(GET_SUBACCOUNT_DETAILS,         verifyAccessToken, getSubAccountDetails);
router.delete(DISCONNECT_GHL,    verifyAccessToken, requireRole("owner", "admin"), disconnectGoHighLevel);
router.delete(DISCONNECT_OPENAI, verifyAccessToken, requireRole("owner", "admin"), disconnectOpenAI);
router.delete(DISCONNECT_STRIPE, verifyAccessToken, requireRole("owner", "admin"), disconnectStripe);

// router for payments integration
router.post(CALL_BILLING_WEBHOOK, express.json(), callBillingWebhook);
router.get(GET_CHARGING_DETAILS, verifyAccessToken, getChargingDetails);
router.put(
  UPDATE_CHARGING_DETAILS,
  verifyAccessToken,
  updateAutoChargingSettings,
);
router.post(AUTO_CARD_PAY_WEBHOOK, autoTopUpLowWalletUsers);
router.get(GET_STRIPE_PORTAL,     verifyAccessToken, getStripePortalLink);
router.get("/number-settings",    verifyAccessToken, getNumberSettings);
router.post("/number-settings",   verifyAccessToken, saveNumberSettings);
router.post("/import-byo-number", verifyAccessToken, importByoNumber);
router.get("/byo-numbers",        verifyAccessToken, getByoNumbers);
router.get("/webhook",            verifyAccessToken, getWebhookConfig);
router.post("/webhook",           verifyAccessToken, saveWebhookConfig);
router.post("/webhook/test",      verifyAccessToken, testWebhook);
router.post("/reassign-number",   verifyAccessToken, reassignNumberAssistant);

module.exports = router;
