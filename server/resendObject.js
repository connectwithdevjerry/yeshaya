const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
require("dotenv").config();

let emailHelper = async (to, subject, html, attachments = null) => {
  const payload = {
    from: `${process.env.APP_NAME} <${process.env.RESEND_EMAIL_USER}>`, // <--- This is your sending address!
    to: [to],
    subject: subject,
    html: html,
  };
  // attachments: [{ filename, content }]  (content = Buffer or base64 string)
  if (attachments && attachments.length) payload.attachments = attachments;

  await resend.emails.send(payload);
};

module.exports = emailHelper;
