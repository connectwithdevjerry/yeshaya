const pdf = require("pdf-parse-new");
const mammoth = require("mammoth");
const sanitizeHtml = require("sanitize-html");
const axios = require("axios");
const userModel = require("./model/user.model");
require("dotenv").config();

const getSubGhlTokens = async (userId, accountId) => {
  const user = await userModel.findById(userId);
  const ghlSubAccountIds = user.ghlSubAccountIds;
  const SUB_CLIENT_ID = process.env.GHL_SUB_CLIENT_ID;
  const SUB_CLIENT_SECRET = process.env.GHL_SUB_CLIENT_SECRET;

  const targetSubaccount = ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId && sub.connected
  );

  const refreshToken = targetSubaccount.ghlSubRefreshToken;

  console.log({ refreshToken });

  try {
    const url = "https://services.leadconnectorhq.com/oauth/token";

    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const response = await axios.post(
      url,
      {
        client_id: SUB_CLIENT_ID,
        client_secret: SUB_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        user_type: "Location",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // httpsAgent, // attach secure agent
        timeout: 10000, // optional safety timeout
      }
    );

    targetSubaccount.ghlSubRefreshToken = response.data.refresh_token;
    targetSubaccount.ghlSubRefreshTokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    user.markModified("ghlSubAccountIds");
    await user.save();

    return { status: true, data: response.data };
  } catch (error) {
    console.error(
      "Error refreshing GHL Access Token:",
      error.response?.data || error.message
    );
    throw new Error(error.message);
  }
};

const extractText = async (file) => {
  const { mimetype, buffer, originalname } = file;

  console.log(
    `Extracting text from file: ${originalname} with mimetype: ${mimetype}`
  );

  if (mimetype === "application/pdf") {
    console.log("Processing PDF file");
    const parsePdf = typeof pdf === "function" ? pdf : pdf.default;
    const data = await parsePdf(buffer);

    const cleanText = sanitizeHtml(data.text, {
      allowedTags: [], // Remove ALL tags, leaving only text
      allowedAttributes: {}, // Remove ALL attributes
      // Ensure the content inside these tags is also deleted
      nonTextTags: ["style", "script", "noscript"],
    });

    // console.log(`Extracted text: ${cleanText}`);
    return cleanText;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${originalname}`);
};

const extractVariables = (template) => {
  const regex = /{{\s*([^}]+)\s*}}/g;
  const variables = new Set();
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.add(match[1]);
  }

  return Array.from(variables);
};

const fillTemplate = (template, values) => {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (match, key) => {
    if (!(key in values)) {
      throw new Error(`Missing value for variable: ${key}`);
    }
    return values[key];
  });
};

module.exports = {
  extractText,
  fillTemplate,
  extractVariables,
  getSubGhlTokens,
};
