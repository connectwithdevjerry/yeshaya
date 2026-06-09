const userModel = require("../model/user.model");
const emailHelper = require("../resendObject");

// Send an email "from" a specific agency: uses their white-label Resend key +
// sender when configured, otherwise falls back to the platform's global config.
const sendUserEmail = async (userId, to, subject, html, attachments = null) => {
  let override = null;
  try {
    const user = await userModel.findById(userId).select("resendApiKey resendFromEmail").lean();
    if (user?.resendApiKey && user?.resendFromEmail) {
      override = { apiKey: user.resendApiKey, from: user.resendFromEmail };
    }
  } catch (_) {}
  return emailHelper(to, subject, html, attachments, override);
};

module.exports = sendUserEmail;
