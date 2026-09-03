const pdf = require("pdf-parse-new");
const mammoth = require("mammoth");
const sanitizeHtml = require("sanitize-html");
const axios = require("axios");
const userModel = require("./model/user.model");
require("dotenv").config();

const getSubGhlTokens = async (userId, accountId) => {
  // Only the sub-account list is read or written here. Loading the full
  // document pulled the unbounded billingEvents array along with it, on a
  // request that can be blocking a live call.
  const user = await userModel.findById(userId).select("ghlSubAccountIds");
  const ghlSubAccountIds = user.ghlSubAccountIds;
  const SUB_CLIENT_ID = process.env.GHL_SUB_CLIENT_ID;
  const SUB_CLIENT_SECRET = process.env.GHL_SUB_CLIENT_SECRET;

  const targetSubaccount = ghlSubAccountIds.find(
    (sub) => sub.accountId === accountId
  );

  if (!targetSubaccount) {
    const err = new Error("GHL_RECONNECT_REQUIRED");
    err.code = "GHL_RECONNECT_REQUIRED";
    throw err;
  }

  const refreshToken = targetSubaccount.ghlSubRefreshToken;

  if (!refreshToken || typeof refreshToken !== "string") {
    targetSubaccount.connected = false;
    user.markModified("ghlSubAccountIds");
    await user.save();
    const err = new Error("GHL_RECONNECT_REQUIRED");
    err.code = "GHL_RECONNECT_REQUIRED";
    throw err;
  }

  // Return cached access token if still valid (60-second buffer)
  if (
    targetSubaccount.ghlSubAccessToken &&
    targetSubaccount.ghlSubAccessTokenExpiry &&
    targetSubaccount.ghlSubAccessTokenExpiry.getTime() > Date.now() + 60000
  ) {
    return {
      status: true,
      data: {
        access_token: targetSubaccount.ghlSubAccessToken,
        refresh_token: refreshToken,
        expires_in: Math.floor(
          (targetSubaccount.ghlSubAccessTokenExpiry.getTime() - Date.now()) / 1000
        ),
      },
    };
  }

  try {
    const url = "https://services.leadconnectorhq.com/oauth/token";

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
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 10000,
      }
    );

    targetSubaccount.ghlSubRefreshToken = response.data.refresh_token;
    targetSubaccount.ghlSubRefreshTokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    targetSubaccount.ghlSubAccessToken = response.data.access_token;
    targetSubaccount.ghlSubAccessTokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    if (targetSubaccount.connected !== true) {
      targetSubaccount.connected = true;
    }
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

// ─── Phone numbers ───────────────────────────────────────────────────────────

// Vapi rejects a call outright ("customer.number must be a valid phone number
// in the E.164 format", HTTP 400) if the number is not exactly E.164, and the
// caller just hears the call fail. Twilio usually sends E.164 in `From`, but
// not always: a withheld caller id can arrive as "anonymous", SIP traffic as
// "sip:+15551234567@domain", and numbers typed into the dashboard for outbound
// calls arrive however a human typed them.
//
// Returns a clean E.164 string, or "" when the input cannot be one.
const toE164 = (raw) => {
  if (!raw) return "";
  let v = String(raw).trim();

  // "sip:+15551234567@carrier.com" / "tel:+15551234567" / "client:name"
  const sip = v.match(/^(?:sips?|tel):([^@;]+)/i);
  if (sip) v = sip[1];

  const hadPlus = v.startsWith("+");
  const digits = v.replace(/\D/g, "");
  if (!digits) return ""; // "anonymous", "unknown", "restricted", …

  let e164;
  if (hadPlus) e164 = `+${digits}`;
  else if (digits.length === 10) e164 = `+1${digits}`; // bare US number
  else if (digits.length === 11 && digits.startsWith("1")) e164 = `+${digits}`;
  else e164 = `+${digits}`;

  return isE164(e164) ? e164 : "";
};

// E.164: "+", a non-zero leading digit, 15 digits total at most.
const isE164 = (v) => /^\+[1-9]\d{1,14}$/.test(String(v || ""));

module.exports = {
  extractText,
  fillTemplate,
  extractVariables,
  getSubGhlTokens,
  toE164,
  isE164,
};
