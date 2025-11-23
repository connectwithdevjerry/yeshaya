const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
require("dotenv").config();

let emailHelper = async (to, subject, html) => {
  await resend.emails.send({
    from: `${process.env.APP_NAME} <${process.env.RESEND_EMAIL_USER}>`, // <--- This is your sending address!
    to: [to],
    subject: subject,
    html: html,
  });
};

module.exports = emailHelper;
