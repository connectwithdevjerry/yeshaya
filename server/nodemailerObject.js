const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // or 'STARTTLS'
  auth: {
    user: process.env.MY_EMAIL_USER,
    pass: process.env.MY_EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error in nodemailer verification:", error);
  }
  if (success) {
    console.log("Nodemailer is ready to send emails.");
  }
});

module.exports = transporter;