const { Resend } = require("resend");
require("dotenv").config();

const defaultResend = new Resend(process.env.RESEND_API_KEY);

// emailHelper(to, subject, html, attachments?, override?)
// override = { apiKey, from } → send via that Resend account/sender (white-label).
// Falls back to the platform's global Resend config.
let emailHelper = async (to, subject, html, attachments = null, override = null) => {
  const client = override?.apiKey ? new Resend(override.apiKey) : defaultResend;
  const from = override?.from || `${process.env.APP_NAME} <${process.env.RESEND_EMAIL_USER}>`;

  const payload = { from, to: [to], subject, html };
  // attachments: [{ filename, content }] (content = Buffer or base64 string)
  if (attachments && attachments.length) payload.attachments = attachments;

  await client.emails.send(payload);
};

module.exports = emailHelper;
