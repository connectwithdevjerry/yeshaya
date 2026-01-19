const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const OpenAI = require("openai");
const stateModel = require("../model/state.model");
const axios = require("axios");
const {
  GHL_OAUTH_CALLBACK,
  STRIPE_OAUTH_CALLBACK,
  GHL_SUB_OAUTH_CALLBACK,
} = require("../constants");
const userModel = require("../model/user.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Stripe = require("stripe");
const { HighLevel } = require("@gohighlevel/api-client");

const https = require("https");
const twilio = require("twilio");
const { getVapiPhoneId } = require("./assistant.controller");
const {
  extractVariables,
  fillTemplate,
  getSubGhlTokens,
} = require("../helperFunctions");
const VoiceResponse = require("twilio").twiml.VoiceResponse;

const SUB_PATH = "/integrations";
const CLIENT_ID = process.env.GHL_APP_CLIENT_ID;
const SUB_CLIENT_ID = process.env.GHL_SUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GHL_APP_CLIENT_SECRET;
const SUB_CLIENT_SECRET = process.env.GHL_SUB_CLIENT_SECRET;
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const ACCOUNT_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VAPI_API_KEY = process.env.VAPI_API_KEY;

const httpsAgent = new https.Agent({
  keepAlive: true,
  minVersion: "TLSv1.2", // ensure strong TLS
});

// GOHIGHLEVEL AUTHENTICATION AND SSO DECRYPTION
const generateSecureState = async (myId, accountId = "") => {
  /**
   Generates a random state string and stores it in the user's session.
   */
  // Generate a 16-byte random string (32 characters hexadecimal)
  const state = crypto.randomBytes(16).toString("hex");

  // Store the state in the session for later verification in the callback
  const saveState = await stateModel({
    state: state,
    cust_id: myId,
    accountId,
  });
  await saveState.save();

  return state;
};

const ghlAuthorize = async (req, res, next) => {
  const userId = req.user;
  const scopes =
    "locations.write+locations.readonly+saas/company.read+saas/company.write+saas/location.read+saas/location.write+users.readonly+users.write+snapshots.readonly+snapshots.write";

  const REDIRECT_URI = encodeURIComponent(
    `${process.env.SERVER_URL}${SUB_PATH}${GHL_OAUTH_CALLBACK}`,
  ); // Must match GHL settings!

  // The 'state' parameter is crucial for security (CSRF protection)
  const state = await generateSecureState(userId);

  const authUrl = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${CLIENT_ID}&scope=${scopes}&version_id=6905111141b5e7b749099891&state=${state}`;

  console.log("Redirecting to GHL OAuth URL:", authUrl);

  return res.send({
    status: true,
    authUrl,
    message: "GHL Authorization URL generated.",
  });
};

const ghlOauthCallback = async (req, res) => {
  // This function will handle the OAuth callback and exchange the code for tokens
  // Implementation would go here

  const REDIRECT_URI = `${process.env.SERVER_URL}${SUB_PATH}${GHL_OAUTH_CALLBACK}`;

  const { code, state: receivedState } = req.query;

  console.log({ code, receivedState });

  const reqState = await stateModel.findOne({ state: receivedState });
  const storedState = reqState ? reqState.state : null;
  const userId = reqState ? reqState.cust_id : null;

  // 1. STATE VERIFICATION (CSRF Protection)
  if (!receivedState || receivedState !== storedState) {
    // Clear the state from the session after use
    await stateModel.deleteOne({ state: receivedState });

    console.error("State mismatch or missing state");
    const errorMsg = "CSRF check failed: Invalid state parameter.";
    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-failed/${encodeURIComponent(
        errorMsg,
      )}`,
    );
  }

  await stateModel.deleteOne({ state: receivedState });

  if (!code) {
    const errorMsg = "Authorization code missing in callback.";

    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-failed/${encodeURIComponent(
        errorMsg,
      )}`,
    );
  }

  const highLevel = new HighLevel({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  try {
    const response = await highLevel.oauth.getAccessToken({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      user_type: "Company",
    });
    console.log({ response });

    const updateUser = await userModel.findById(userId);

    // save agency id
    if (!updateUser.ghlAgencyId) {
      updateUser.ghlAgencyId = response.companyId;
      await updateUser.save();
    }

    if (updateUser.ghlAgencyId !== response.companyId) {
      return res.send({
        status: false,
        message: "Account Cross-Breeding Not allowed!",
      });
    }

    updateUser.ghlRefreshToken = response.refresh_token;
    updateUser.ghlRefreshTokenExpiry = new Date(
      Date.now() + response.expires_in * 1000,
    );

    await updateUser.save();

    const successMsg = "GHL Connection successful!";
    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-success/${encodeURIComponent(
        successMsg,
      )}`,
    );
  } catch (error) {
    console.error(
      "Token Exchange Error:",
      error.response ? error.response.data : error.message,
    );

    const errorMsg = "Failed to exchange authorization code for access token.";

    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-failed/${encodeURIComponent(
        errorMsg,
      )}`,
    );
  }
};

const decodeJWTokens = (accessToken, refreshToken) => {
  try {
    // Use jwt.decode() to get the payload without verification
    const decodedAccess = jwt.decode(accessToken);

    const decodedRefresh = jwt.decode(refreshToken);

    return { status: true, decodedAccess, decodedRefresh };
  } catch (error) {
    console.error("Error decoding/verifying JWT:", error.message);
    return { status: false, message: error.message };
  }
};

const getAttachedSubaccounts = async (accessToken) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: "https://services.leadconnectorhq.com/locations/search",
    headers: {
      Accept: "application/json",
      Version: "2021-07-28",
      Authorization: `Bearer ${accessToken}`, // agency level accessToken
    },
  };

  try {
    const response = await axios.request(config);
    console.log(JSON.stringify(response.data));

    return { subAccounts: response.data, status: true };
  } catch (error) {
    console.log(error);
    console.error("Error fetching subaccounts:", error.message);
    console.error("Full error details:", error.response?.data || error.message);
    return {
      subAccounts: [],
      status: false,
      message: "Full error details:" + error.response?.data || error.message,
    };
  }
};

const getGhlTokens = async (userId) => {
  const user = await userModel.findById(userId);
  const refreshToken = user.ghlRefreshToken;

  console.log({ refreshToken });

  try {
    const url = "https://services.leadconnectorhq.com/oauth/token";

    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const response = await axios.post(
      url,
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        user_type: "Company",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // httpsAgent, // attach secure agent
        timeout: 10000, // optional safety timeout
      },
    );

    user.ghlRefreshToken = response.data.refresh_token;
    user.ghlRefreshTokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000,
    );
    await user.save();

    return { status: true, data: response.data };
  } catch (error) {
    console.error(
      "Error refreshing GHL Access Token:",
      error.response?.data || error.message,
    );
    return {
      status: false,
      message: `Error refreshing GHL Access Token:${
        error.response?.data || error.message
      }`,
    };
  }
};

const callGetSubaccounts = async (req, res) => {
  try {
    const userId = req.user;
    const userType = req.query.userType;

    console.log({ userType });

    const reqDetails = await getSubAccountsHelper(userId);
    const { status, subAccounts } = reqDetails;

    const user = await userModel.findById(userId);
    const installedSubAccounts = user.ghlSubAccountIds.map(
      (account) => account.connected === true && account.accountId,
    );

    if (userType == "anon") {
      return res.send({
        status: true,
        data: subAccounts,
      });
    }

    const filteredSubAccounts = subAccounts.locations.filter((subAccount) =>
      installedSubAccounts.includes(subAccount.id),
    );

    return res.send({
      status: true,
      data: filteredSubAccounts,
      agencyId: user.ghlAgencyId,
    });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const getSubAccountsHelper = async (userId) => {
  const getGhlTokensValue = await getGhlTokens(userId);

  const access_token = getGhlTokensValue?.data?.access_token;
  const refresh_token = getGhlTokensValue?.data?.access_token;
  const expires_in = getGhlTokensValue?.data?.expires_in;
  const a_message = getGhlTokensValue?.data?.message;

  console.log({ access_token, refresh_token, expires_in });

  if (!access_token || !refresh_token || !expires_in)
    return { status: false, message: a_message };

  const response = await getAttachedSubaccounts(access_token);

  return response;
};

const getSubAccount = async (accessToken, subAccountId) => {
  const axios = require("axios");

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `https://services.leadconnectorhq.com/locations/${subAccountId}`,
    headers: {
      Accept: "application/json",
      Version: "2021-07-28",
      Authorization: `Bearer ${accessToken}`, // agency level accessToken
    },
  };

  try {
    const response = await axios.request(config);

    // console.log(JSON.stringify(response.data));
    console.log({ subaccountdata: response.data });

    return { status: true, data: response.data, subAccountId };
  } catch (error) {
    console.log(error);

    return { status: false, message: error.message, subAccountId };
  }
};

const importGhlSubaccount = async (req, res) => {
  const { subAccountId } = req.body;
  const userId = req.user;

  const user = await userModel.findById(userId);

  const subAccountInDb = user.ghlSubAccountIds.filter(
    (account) => account.accountId === subAccountId,
  );

  if (subAccountInDb.length > 0)
    return res.send({
      status: false,
      message: "Sub-account Already Installed!",
    });

  const getGhlTokensValue = await getGhlTokens(userId);

  const access_token = getGhlTokensValue?.data?.access_token;
  const refresh_token = getGhlTokensValue?.data?.access_token;
  const expires_in = getGhlTokensValue?.data?.expires_in;
  const a_message = getGhlTokensValue?.data?.message;

  console.log({ access_token, refresh_token, expires_in });

  if (!access_token || !refresh_token || !expires_in)
    return res.send({ status: false, message: a_message });

  const getSubAccountValues = await getSubAccount(access_token, subAccountId);
  const status = getSubAccountValues?.status;
  const data = getSubAccountValues?.data;
  const message = getSubAccountValues?.message;
  // if status is true, it means the location id works well with the access token, which authenticates the presence of this subaccountId

  console.log({ getSubAccountValues });

  if (!status) {
    console.log();
    return res.send({ status: false, message });
  }

  // since the access token is linked with the refresh token (which is linked with this particular agency and stored in the databse), there's no point doing an agency comparation again. This access token is used with the subaccount id to prove tha authenticity of the owner

  user.ghlSubAccountIds.push({
    accountId: subAccountId,
    connected: true,
    vapiAssistants: [],
    numberDetails: [],
  });

  await user.save();

  return res.send({ status: true, data, subaccounts: user.ghlSubAccountIds });
};

const importGhlSubaccounts = async (req, res) => {
  const { accountIds } = req.body;
  const userId = req.user;

  console.log({ accountIds });

  const subAccountIds = accountIds;

  const user = await userModel.findById(userId);

  const subAccountsInDb = user.ghlSubAccountIds.map(
    (account) => account.accountId,
  );

  console.log(subAccountsInDb);

  const missing = subAccountIds.filter(
    (item) => !subAccountsInDb.includes(item),
  );

  if (missing.length === 0)
    return res.send({
      status: false,
      message: "Sub-accounts Already Installed!",
    });

  const values = await getGhlTokens(userId);

  const { access_token, refresh_token, expires_in } = values.data;

  console.log({ access_token, refresh_token, expires_in });

  const mIm = await import("p-limit");
  const pLimit = mIm.default;

  const limit = pLimit(5); // 5 at a time
  const promises = missing.map((id) =>
    limit(() => getSubAccount(access_token, id)),
  );

  const results = await Promise.all(promises);
  console.log({ results });

  results.forEach((result) => {
    if (result.status) {
      // true shows the subaccount id is linked to the agency account
      user.ghlSubAccountIds.push({
        accountId: result.subAccountId,
        connected: true,
        vapiAssistants: [],
        numberDetails: [],
      });
    }
  });

  await user.save();

  // if status is true, it means the location id works well with the access token, which authenticates the presence of this subaccountId

  // since the access token is linked with the refresh token (which is linked with this particular agency and stored in the databse), there's no point doing an agency comparation again. This access token is used with the subaccount id to prove tha authenticity of the owner

  return res.send({
    status: true,
    data: results,
    installedAccounts: user.ghlSubAccountIds,
  });
};

const decryptGhlSsoPayload = (encryptedPayload, ssoKey) => {
  if (!encryptedPayload || !ssoKey) {
    console.error("Missing encrypted payload or SSO Key.");
    return null;
  }

  // 1. Decode the base64 payload into a Buffer
  const buffer = Buffer.from(encryptedPayload, "base64");

  // 2. Extract IV (Initialization Vector) and Ciphertext
  // GHL SSO often puts the 16-byte IV at the start of the payload.
  const IV_LENGTH = 16;
  if (buffer.length < IV_LENGTH) {
    console.error("Payload too short to contain IV.");
    return null;
  }
  const iv = buffer.subarray(0, IV_LENGTH);
  const cipherText = buffer.subarray(IV_LENGTH);

  // 3. Create the Decipher
  try {
    const key = Buffer.from(ssoKey, "utf8"); // The key must be a 32-byte (256-bit) buffer
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    // 4. Decrypt the data
    let decrypted = decipher.update(cipherText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // 5. Parse the decrypted JSON string
    const jsonString = decrypted.toString("utf8");
    const sessionData = JSON.parse(jsonString);

    return sessionData;
  } catch (error) {
    console.error("SSO Decryption Error:", error.message);
    return null;
  }
};

const connectOpenAI = async (req, res) => {
  const apiKey = req.body.apiKey;
  const userId = req.user;

  if (!apiKey || typeof apiKey !== "string" || !apiKey.startsWith("sk-")) {
    return res.send({
      status: false,
      message: "API key is required in the correct format.",
    });
  }

  const updateKey = await userModel.findById(userId);

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.models.list();

    if (response && Array.isArray(response.data) && response.data.length > 0) {
      console.log("API Key is valid and authorized.");
      console.log(`(Found ${response.data.length} models.)`);

      updateKey.openAIApiKey = apiKey;
      await updateKey.save();

      return res.send({ status: true, message: "API Key is valid." });
    }

    updateKey.openAIApiKey = "";
    await updateKey.save();

    return res.send({ status: false, message: "API Key test failed." });
  } catch (error) {
    if (error.status === 401) {
      console.error("API Key is invalid or expired (401 Unauthorized).");
    } else if (error.status === 429) {
      console.warn(
        "API Key is valid but currently rate-limited or has insufficient usage credit (429).",
      );
    } else {
      console.error(`An unexpected error occurred: ${error.message}`);
    }
    return res.send({ status: false, message: "API Key not valid." });
  }
};

const testOpenAIKey = async (req, res) => {
  const userId = req.user;

  const key = await userModel.findById(userId);
  const apiKey = key.openAIApiKey;

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.models.list();

    if (response && Array.isArray(response.data) && response.data.length > 0) {
      console.log("API Key is valid and authorized.");
      console.log(`(Found ${response.data.length} models.)`);

      return res.send({ status: true, message: "API Key is valid." });
    }

    key.openAIApiKey = "";
    await key.save();

    return res.send({ status: false, message: "API Key test failed." });
  } catch (error) {
    if (error.status === 401) {
      console.error("API Key is invalid or expired (401 Unauthorized).");
    } else if (error.status === 429) {
      console.warn(
        "API Key is valid but currently rate-limited or has insufficient usage credit (429).",
      );
    } else {
      console.error(`An unexpected error occurred: ${error.message}`);
    }
    key.openAIApiKey = "";
    await key.save();
    return res.send({ status: false, message: "API Key not valid." });
  }
};

const checkIntegrationStatus = async (req, res) => {
  const userId = req.user;

  const key = await userModel.findById(userId);
  const apiKey = key.openAIApiKey;

  let intResponse = {};

  // openai check
  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.models.list();

    if (response && Array.isArray(response.data) && response.data.length > 0) {
      console.log("API Key is valid and authorized.");
      console.log(`(Found ${response.data.length} models.)`);

      intResponse = {
        ...intResponse,
        openai: { status: true, message: "API Key is valid." },
      };
    }
  } catch (error) {
    if (error.status === 401) {
      console.error("API Key is invalid or expired (401 Unauthorized).");
    } else if (error.status === 429) {
      console.warn(
        "API Key is valid but currently rate-limited or has insufficient usage credit (429).",
      );
    } else {
      console.error(`An unexpected error occurred: ${error.message}`);
    }
    intResponse = {
      ...intResponse,
      openai: { status: false, message: error.message },
    };
  }

  // try {
  // expiry date for refresh token
  intResponse = {
    ...intResponse,
    ghl: { status: true, expiryDate: key.ghlRefreshTokenExpiry },
  };

  intResponse = {
    ...intResponse,
    stripe: { status: true, presence: key.stripeAccessToken ? true : false },
  };

  return res.send(intResponse);
  // } catch (error) {
  //   return res.send({ status: false, error: error.message, intResponse });
  // }
};

const ghlSsoLoginHandler = async (req, res) => {
  // 1. Get encrypted payload from the POST request body
  const { encryptedPayload } = req.body;

  // NOTE: In a real app, read the SSO_KEY from environment variables for security
  const GHL_SSO_KEY = process.env.GHL_SSO_KEY;

  // 2. Decrypt the session data
  const sessionData = decryptGhlSsoPayload(encryptedPayload, GHL_SSO_KEY);

  if (!sessionData) {
    return res.status(401).send("SSO Authentication Failed.");
  }

  // 3. Process Decrypted Data and Authenticate
  const { userId, locationId, firstName, lastName, email } = sessionData;

  // TODO:
  // a) Look up the user in YOUR database using the GHL 'userId' or 'email'.
  // b) If the user doesn't exist, create a new user entry.
  // c) Establish a secure session (e.g., generate an access token or set a cookie).

  // Example Session Data Structure (what GHL sends after decryption):
  /*
    {
      "userId": "jA0E5e1aF2b3c4d5e6f7g8h9i0",
      "locationId": "a1b2c3d4e5f6g7h8i9j0k1l2",
      "agencyId": "A1B2C3D4E5F6G7H8I9J0K1L2",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      // ... other fields
    }
    */

  // 4. Respond to the iFrame with a success message or redirect URL
  console.log(`Successfully authenticated user: ${firstName} (${email})`);

  // In a real application, you'd send a token or redirect to your app's main view
  return res.status(200).json({
    success: true,
    message: "Authentication successful",
    user: { userId, locationId, email },
  });
};

const stripeAuthorize = async (req, res) => {
  const userId = req.user;

  const STRIPE_CONNECT_URL = "https://connect.stripe.com/oauth/authorize";
  const CLIENT_ID = process.env.STRIPE_CLIENT_ID;

  const REDIRECT_URI = `${process.env.SERVER_URL}${SUB_PATH}${STRIPE_OAUTH_CALLBACK}`;

  // Generate a unique state token
  const state = crypto.randomBytes(16).toString("hex");

  // Store the state token for later verification (mapping it to your customer's session/ID)
  const saveState = await new stateModel({ state, cust_id: `cust_${userId}` });
  await saveState.save();

  // Scopes define what permissions you are requesting from the connected account
  const scopes = "read_write"; // Grants permission to read and write data (e.g., manage charges, bank accounts)

  const authorizeUrl =
    `${STRIPE_CONNECT_URL}?` +
    new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      state: state,
    }).toString();

  // Redirect your customer to Stripe to begin the onboarding process
  res.send({ status: true, authorizeUrl });
};

const testStripeToken = async (req, res) => {
  try {
    const userId = req.user;
    const user = await userModel.findById(userId);

    const accessToken = user.stripeAccessToken;

    if (!accessToken) {
      return res.send({
        status: false,
        error: "No Stripe access token found for user.",
      });
    }

    const stripe = new Stripe(accessToken);
    const account = await stripe.accounts.retrieve();

    return res.send({ status: true, message: "Token is valid", account });
  } catch (error) {
    return res.send({ status: false, error: error.message });
  }
};

const stripeOauthCallback = async (req, res) => {
  const { code, state, error } = req.query;

  const storedState = await stateModel.findOne({ state });
  const storedStateValue = storedState ? storedState.state : null;

  const cust_id = storedState ? storedState.cust_id : null;
  const userId = cust_id?.replace("cust_", ""); // In this example, we stored cust_id in stateModel

  if (error) {
    // Handle potential errors returned by Stripe (e.g., user denied access)
    console.error("Stripe Connect Error:", error);
    return res.status(400).send(`Connection Failed: ${error}`);
  }

  if (!state || state !== storedStateValue) {
    // return res
    //   .status(403)
    //   .send("Invalid or missing state parameter. CSRF attempt detected.");
    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/payment/connection-failed/${encodeURIComponent(
        "CSRF check failed: Invalid state parameter.",
      )}`,
    );
  }

  await stateModel.deleteOne({ state });

  // --- B. Exchange Code for Access Token ---
  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code: code,
    });

    const {
      access_token,
      refresh_token,
      stripe_user_id, // This is the ID of your customer's new/connected Stripe account (acct_...)
      stripe_publishable_key,
    } = response;

    // --- C. Store Credentials (CRITICAL) ---

    // In a real app, you MUST securely save these tokens and the stripe_user_id
    // to your database, linked to your internal customer ID (genUserStripeId).

    console.log(`
            SUCCESS! Connected Account Details:
            - Stripe Account ID (stripe_user_id): ${stripe_user_id}
            - Access Token: ${access_token} (Use this to make API calls on their behalf)
            - Refresh Token: ${refresh_token} (Use this to get new access tokens)
        `);

    // Stripe tokens doesn't expire, they can be revoked though.
    // However, I'm storing them so I can implement token refresh logic if needed in future.
    // Refresh tokens works just once per exchange. So I'm not storing them for now.

    const updateUser = await userModel.findById(userId);

    updateUser.stripeUserId = stripe_user_id;
    updateUser.stripePublishableKey = stripe_publishable_key; // Storing publishable key as customer identifier
    updateUser.stripeAccessToken = access_token; // Storing access token
    await updateUser.save();

    console.log("Stripe credentials saved to user profile.", updateUser);

    // Example: Retrieve the connected account's details to confirm capabilities
    const account = await stripe.accounts.retrieve(stripe_user_id);
    const paymentsEnabled = account.capabilities?.card_payments === "active";

    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/payment/connection-success/${encodeURIComponent(
        `Stripe Connection successful! Payments Enabled: ${
          paymentsEnabled ? "Yes" : "No"
        } \n Stripe Account ID: ${stripe_user_id}`,
      )}`,
    );
  } catch (e) {
    console.error("Token Exchange Failed:", e.message);
    // return res.status(500).send(`Token exchange failed: ${e.message}`);
    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/payment/connection-failed/${encodeURIComponent(
        "Token exchange failed. Please try again.",
      )}`,
    );
  }
};

const chargeUserCustomers = async (req, res) => {
  // 1. Lookup the connected account's ID for the customer being paid
  // In a real app, this ID comes from your database based on who the customer is paying.
  const { amount } = req.body;
  const user = await userModel.findById(req.user);
  const connectedAccountId = await user.stripeUserId;

  if (!connectedAccountId) {
    // return res
    //   .status(404)
    //   .json({ error: "Connected account ID not found for this user." });
    return res.send({
      status: false,
      message: "Connected account ID not found for this user.",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        payment_method_types: ["card"],
        amount: amount * 100, // in cents ($10.00 for 1000 cents)
        currency: "usd",
        // CRITICAL: Use the Stripe-Account header to act on their behalf
      },
      {
        stripeAccount: connectedAccountId,
      },
    );

    // The connected account receives the funds and pays Stripe fees.
    // The PaymentIntent created belongs to the connected account, not your platform.

    return res.send({
      status: true,
      message: "Payment Intent created successfully.",
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      accountId: connectedAccountId,
    });
  } catch (error) {
    console.error(
      "Error creating Payment Intent on behalf of connected account:",
      error,
    );
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const buyUsPhoneNumber = async (req, res) => {
  try {
    let { numberToBuy, subaccount, assistant } = req.body;
    const userId = req.user;

    // add + if not present in number to buy
    if (!numberToBuy.startsWith("+")) {
      numberToBuy = `+${numberToBuy.trim()}`;
    }

    const user = await userModel.findById(userId);

    const getSubAccount = user.ghlSubAccountIds?.filter(
      (account) => account.accountId === subaccount,
    );

    if (!getSubAccount.length) {
      return res.send({
        status: false,
        message: "Subaccount ID do not match this account or not installed!",
      });
    }

    const getAssistant = getSubAccount[0]?.vapiAssistants.filter(
      (massistant) => massistant.assistantId === assistant,
    );

    if (!getAssistant.length) {
      return res.send({
        status: false,
        message: "No assistant with this account for this number!",
      });
    }

    const client = twilio(ACCOUNT_SID, ACCOUNT_AUTH_TOKEN);
    console.log("Searching for an available US phone number...");

    console.log(`Attempting to purchase ${numberToBuy}...`);

    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: numberToBuy,
      // Optional: Configure webhook URLs for voice and SMS handling
      // voiceUrl: `${process.env.SERVER_URL}/integrations/voiceurl/${userId}/${subaccount}/${assistant}`,
      // smsUrl: `${process.env.SERVER_URL}/integrations/smsurl/${userId}/${subaccount}/${assistant}`,
      // voiceFallbackUrl: "",
      // smsFallbackUrl: "",
    });

    console.log({ purchasedNumber });

    // console.log("SUCCESS! Phone number purchased.");
    // console.log(`SID: ${purchasedNumber.sid}`);
    // console.log(`Number: ${purchasedNumber.phoneNumber}`);

    // console.log(getSubAccount);

    getAssistant[0].numberDetails.push({
      phoneNum: purchasedNumber?.phoneNumber,
      phoneSid: purchasedNumber?.sid,
    });

    await user.save();

    return res.send({ status: true, purchasedNumber });
  } catch (error) {
    console.error("An error occurred during the purchase process:");
    // Check for specific Twilio error codes (e.g., insufficient funds, number already taken)
    if (error.status === 400 && error.code === 21451) {
      return res.send({
        status: false,
        message:
          "Error: The number is no longer available or there was a conflict.",
      });
    } else if (error.status === 400 && error.code === 21608) {
      return res.send({
        status: false,
        message:
          "Error: Insufficient funds in your Twilio account to purchase the number.",
      });
    } else {
      console.error(error.message);
      return res.send({
        status: false,
        message: error.message,
      });
    }
  }
};

const getAvailableNumbers = async (req, res) => {
  // Initialize the Twilio client
  const client = twilio(ACCOUNT_SID, ACCOUNT_AUTH_TOKEN);

  try {
    console.log("1. Searching for an available US phone number...");

    // Step 1: Search for an available US local number
    const numbers = await client
      .availablePhoneNumbers("US")
      .local.list({ limit: 50 });

    if (numbers.length === 0) {
      return res.send({
        status: false,
        message: "No available numbers found. Exiting.",
      });
    }

    return res.send({
      status: true,
      data: numbers,
      message: `Successfully got ${numbers.length} numbers!`,
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

// inbound calls handler - check assistant controller for outbound calls handler
const twilioCallReceiver = async (req, res) => {
  try {
    const { userId, subaccount, assistant } = req.params;
    // Twilio sends caller's number in req.body.From

    console.log("Received incoming call webhook from Twilio:", req.params);

    const callerNumber = req.body.From;
    const receiverNumber = req.body.To;

    console.log(`Incoming call detected from: ${callerNumber}`);

    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.filter(
      (account) => account.accountId === subaccount,
    );

    const targetAssistant = targetSubaccount[0].vapiAssistants.filter(
      (vapiAssistant) => vapiAssistant.assistantId === assistant,
    );

    const targetPhoneNumber = targetAssistant[0].numberDetails.filter(
      (number) => number.phoneNum === receiverNumber,
    );

    const VAPI_PHONE_NUMBER_ID = targetPhoneNumber[0].vapiPhoneNumId;

    console.log({ VAPI_PHONE_NUMBER_ID });

    const inboundDynamicMessage = targetAssistant.inboundDynamicMessage || "";
    let greetingsValues = {};
    let myCustomer = {};

    const checkMessageAvailability =
      inboundDynamicMessage && inboundDynamicMessage.trim() !== "";

    const refreshGhlTokensValue = await getSubGhlTokens(userId, subaccount);

    if (!refreshGhlTokensValue.status) {
      throw new Error(
        `Failed to refresh GHL tokens: ${refreshGhlTokensValue.message}`,
      );
    }

    const accessToken = refreshGhlTokensValue?.data?.access_token;

    if (checkMessageAvailability) {
      const response = await axios.get(
        "https://services.leadconnectorhq.com/contacts/search",
        {
          params: {
            locationId: subaccount,
            query: callerNumber, // GHL search allows querying by phone number string
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Version: "2021-07-28", // Required GHL API Version
            Accept: "application/json",
          },
        },
      );

      console.log({ ghlContactSearchResponse: response.data });

      // GHL returns an array of contacts. We check if at least one exists.
      const contacts = response.data.contacts;
      if (contacts && contacts.length > 0) {
        myCustomer = contacts[0];
      }

      const greetingsVariables = extractVariables(inboundDynamicMessage);

      const variableValues = greetingsVariables.map((variable) => {
        // if (!myCustomer[variable]) return false;
        greetingsValues[variable] = myCustomer[variable] || "there!";
        return true;
      });
    }

    const message = fillTemplate(inboundDynamicMessage, greetingsValues);

    // Call the Vapi API to start the AI conversation
    const vapiResponse = await axios.post(
      "https://api.vapi.ai/call",
      {
        // This ID is the unique Vapi ID for the Twilio number you imported
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        // Set to true to return TwiML instead of immediately dialing
        phoneCallProviderBypassEnabled: true,
        customer: {
          number: callerNumber,
        },
        assistantId: assistant,
        assistantOverrides: {
          ...(message && { firstMessage: message }),
          firstMessageMode: "assistant-speaks-first",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Vapi returns the TwiML needed to transfer control back to Vapi's SIP server
    const returnedTwiml = vapiResponse.data.phoneCallProviderDetails.twiml;

    // Respond to Twilio with the Vapi-generated TwiML
    console.log("Responding to Twilio with Vapi TwiML.");
    return res.type("text/xml").send(returnedTwiml);
  } catch (error) {
    console.error(
      "Error handling Twilio incoming call:",
      error.response?.data || error.message,
    );
    // Send a default TwiML response to Twilio to avoid connection errors
    const twimlError =
      "<Response><Say>An error occurred connecting your call. Please try again later.</Say></Response>";
    return res.status(500).type("text/xml").send(twimlError);
  }
};

const twilioSmsReceiver = async (req, res) => {
  try {
    const { userId, subaccount, assistant } = req.params;

    // Twilio sends caller's number in req.body.From
    const callerNumber = req.body.From;

    console.log(`Incoming call detected from: ${callerNumber}`);

    // Call the Vapi API to start the AI conversation
    const vapiResponse = await axios.post(
      "https://api.vapi.ai/call",
      {
        // This ID is the unique Vapi ID for the Twilio number you imported
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        // Set to true to return TwiML instead of immediately dialing
        phoneCallProviderBypassEnabled: true,
        customer: {
          number: callerNumber,
        },
        assistantId: YOUR_ASSISTANT_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_PRIVATE_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    // Vapi returns the TwiML needed to transfer control back to Vapi's SIP server
    const returnedTwiml = vapiResponse.data.phoneCallProviderDetails.twiml;

    // Respond to Twilio with the Vapi-generated TwiML
    console.log("Responding to Twilio with Vapi TwiML.");
    return res.type("text/xml").send(returnedTwiml);
  } catch (error) {
    console.error(
      "Error handling Twilio incoming call:",
      error.response?.data || error.message,
    );
    // Send a default TwiML response to Twilio to avoid connection errors
    const twimlError =
      "<Response><Say>An error occurred connecting your call. Please try again later.</Say></Response>";
    return res.status(500).type("text/xml").send(twimlError);
  }
};

const importTwilioNumberToVapi = async (req, res) => {
  try {
    // what happens here;
    // we link the phone to vapi ai
    // we save the importation id, phoneSid
    // we update the sms and phone webhook url
    // if the number is bought from us, the user doesn't need to give us a phoneSid
    // this only supports twilio, we can always extend to other services
    // try {
    console.log("Importing Twilio number to Vapi...");
    let { subaccountId, assistantId, twilioNumber } = req.body;
    const userId = req.user;
    // add +1 if not present
    if (!twilioNumber.startsWith("+")) {
      twilioNumber = `+${twilioNumber.trim()}`;
    }

    // if (newPhoneNumberId) {
    const user = await userModel.findById(userId);
    const getSubAccount = user.ghlSubAccountIds.filter(
      (subaccount) => subaccount.accountId === subaccountId,
    );

    const getAssistant = getSubAccount[0]?.vapiAssistants.filter(
      (assistant) => assistant.assistantId === assistantId,
    );

    if (!getAssistant.length) {
      return res.send({
        status: false,
        message: "No assistant with this account for this number!",
      });
    }

    const getPhoneNumber = getAssistant[0]?.numberDetails.filter(
      (number) => number.phoneNum === twilioNumber,
    );

    if (!getPhoneNumber.length) {
      return res.send({
        status: false,
        message:
          "No phone number with this assistant for this number! Make sure the number is added to the assistant first.",
      });
    }
    const phoneSid = getPhoneNumber[0].phoneSid;

    console.log({ phoneSid });

    const VAPI_IMPORT_URL = "https://api.vapi.ai/phone-number";

    const response = await axios.post(
      VAPI_IMPORT_URL,
      {
        // Specify the provider
        provider: "twilio",
        // The number to import (must be in E.164 format)
        number: twilioNumber,
        // Your Twilio credentials
        twilioAccountSid: ACCOUNT_SID,
        twilioAuthToken: ACCOUNT_AUTH_TOKEN,
        assistantId: assistantId,
        smsEnabled: true,
        // The API may also accept twilioApiKey and twilioApiSecret for some users
      },
      {
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          // "Content-Type": "application/json",
        },
      },
    );

    // The response data contains the newly created phone number object
    const newPhoneNumberId = response.data.id;

    console.log(
      `Imported Twilio number. VAPI_PHONE_NUMBER_ID: ${newPhoneNumberId}`,
    );

    console.log(getPhoneNumber);

    // update twilio to add voice, sms
    const client = twilio(ACCOUNT_SID, ACCOUNT_AUTH_TOKEN);
    const incomingPhoneNumber = await client
      .incomingPhoneNumbers(phoneSid)
      .update({
        voiceUrl: `${process.env.SERVER_URL}/integrations/voiceurl/${userId}/${subaccountId}/${assistantId}`,
        // smsUrl: `${process.env.SERVER_URL}/integrations/smsurl/${userId}/${subaccountId}/${assistantId}`, //no longer needed since vapi will handle it automatically
      });

    // save the id
    // if (!getPhoneNumber.length) {
    //   getAssistant.numberDetails.push({
    //     phoneNum: twilioNumber,
    //     vapiPhoneNumId: newPhoneNumberId,
    //     phoneSid: getPhoneNumber[0].phoneSid,
    //   });
    // } else {
    getPhoneNumber[0].vapiPhoneNumId = newPhoneNumberId;
    // }

    await user.save();

    console.log(
      `Successfully imported Twilio number. VAPI_PHONE_NUMBER_ID: ${newPhoneNumberId}`,
    );
    return res.send({
      status: true,
      newPhoneNumberId,
      incomingPhoneNumber,
      message: `Successfully imported Twilio number. VAPI_PHONE_NUMBER_ID: ${newPhoneNumberId}`,
    });
  } catch (error) {
    // } else {
    return res.send({
      status: false,
      message: `${error.message}`,
      data: error.response?.data,
    });
  }
  // } catch (error) {
  //   console.error(
  //     "Error importing Twilio number:",
  //     error.response?.data || error.message
  //   );
  //   return res.send({
  //     status: false,
  //     message:
  //       "Error importing Twilio number:" + error.response?.data ||
  //       error.message,
  //   });
  // }
};

const getPurchasedNumbers = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, assistantId } = req.query;

    console.log({ subaccountId, assistantId });

    const user = await userModel.findById(userId);

    const targetSubaccount = user.ghlSubAccountIds.filter(
      (account) => account.accountId === subaccountId,
    );

    console.log({ targetSubaccount });
    console.log({ m: targetSubaccount[0].vapiAssistants });

    const targetAssistant = targetSubaccount[0].vapiAssistants.filter(
      (vapiAssistant) => vapiAssistant.assistantId === assistantId,
    );

    if (!targetAssistant.length) {
      return res.send({
        status: false,
        message: "No assistant with this account!",
      });
    }

    console.log({ targetAssistant });

    const mIm = await import("p-limit");
    const pLimit = mIm.default;

    const limit = pLimit(5); // 5 at a time
    const promises = targetAssistant[0].numberDetails.map((number) =>
      limit(async () => {
        try {
          const client = twilio(ACCOUNT_SID, ACCOUNT_AUTH_TOKEN);
          const phoneNumberDetails = await client
            .incomingPhoneNumbers(number.phoneSid)
            .fetch();

          // The object contains all data, including webhooks, capabilities, etc.
          return { status: true, phoneNumberDetails };
        } catch (error) {
          return {
            status: false,
            message: error.message,
            phoneNumber: number.phoneNum,
          };
        }
      }),
    );

    const phoneNumbers = await Promise.all(promises);
    console.log({ phoneNumbers });

    return res.send({
      status: true,
      data: phoneNumbers,
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const getVapiNumberImportStatus = async (req, res) => {
  try {
    const { phoneNum } = req.query;
    const getPhoneNumId = await getVapiPhoneId(phoneNum);

    console.log({ getPhoneNumId });

    if (!getPhoneNumId.status) {
      return res.send({
        status: false,
        message: getPhoneNumId.message,
      });
    }

    const phoneNumId = getPhoneNumId.vapiPhoneNumId;
    const VAPI_IMPORT_STATUS_URL = `https://api.vapi.ai/phone-number/${phoneNumId}`;

    const response = await axios.get(VAPI_IMPORT_STATUS_URL, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        // "Content-Type": "application/json",
      },
    });
    console.log({ response: response.data });

    // The response data contains the newly created phone number object
    return res.send({ status: true, data: response.data });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

// to be tested better one has been written in assistant controller
// which delete both from twilio and from our database and vapi
const deleteTwilioNumber = async (req, res) => {
  try {
    const { phoneSid } = req.body;

    const client = twilio(ACCOUNT_SID, ACCOUNT_AUTH_TOKEN);
    await client.incomingPhoneNumbers(phoneSid).remove();

    // delete from database
    const userId = req.user;
    const user = await userModel.findById(userId);

    user.ghlSubAccountIds.forEach((subaccount) => {
      subaccount.vapiAssistants.forEach((assistant) => {
        assistant.numberDetails = assistant.numberDetails.filter(
          (number) => number.phoneSid !== phoneSid,
        );
      });
    });

    // remove number from assistants
    user.ghlSubAccountIds.forEach((subaccount) => {
      subaccount.vapiAssistants.forEach((assistant) => {
        assistant.numberDetails = assistant.numberDetails.filter(
          (number) => number.phoneSid !== phoneSid,
        );
      });
    });

    await user.save();

    return res.send({ status: true, message: "Phone number deleted." });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const ghlSubAuthorize = async (req, res) => {
  const userId = req.user;
  const { accountId } = req.query;
  const scopes =
    "locations.readonly+oauth.write+oauth.readonly+businesses.write+businesses.readonly+calendars.write+calendars.readonly+calendars%2Fevents.readonly+calendars%2Fevents.write+calendars%2Fgroups.readonly+calendars%2Fgroups.write+calendars%2Fresources.readonly+calendars%2Fresources.write&version_id=696ade02ea0d940c862c9efd";

  const REDIRECT_URI = encodeURIComponent(
    `${process.env.SERVER_URL}${SUB_PATH}${GHL_SUB_OAUTH_CALLBACK}`,
  ); // Must match GHL settings!

  // The 'state' parameter is crucial for security (CSRF protection)
  const state = await generateSecureState(userId, accountId);

  const authUrl = `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&redirect_uri=${REDIRECT_URI}&client_id=${SUB_CLIENT_ID}&scope=${scopes}&version_id=6905111141b5e7b749099891&state=${state}`;

  console.log("Redirecting to GHL OAuth URL:", authUrl);

  return res.send({
    status: true,
    authUrl,
    message: "GHL Authorization URL generated.",
  });
};

const ghlSubOauthCallback = async (req, res) => {
  // This function will handle the OAuth callback and exchange the code for tokens
  // Implementation would go here

  const REDIRECT_URI = `${process.env.SERVER_URL}${SUB_PATH}${GHL_SUB_OAUTH_CALLBACK}`;

  const { code, state: receivedState } = req.query;

  console.log({ code, receivedState });

  const reqState = await stateModel.findOne({ state: receivedState });
  const storedState = reqState ? reqState.state : null;
  const userId = reqState ? reqState.cust_id : null;
  const accountId = reqState ? reqState.accountId : null;

  // 1. STATE VERIFICATION (CSRF Protection)
  if (!receivedState || receivedState !== storedState) {
    // Clear the state from the session after use
    await stateModel.deleteOne({ state: receivedState });

    console.error("State mismatch or missing state");
    const errorMsg = "CSRF check failed: Invalid state parameter.";
    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-failed/${encodeURIComponent(
        errorMsg,
      )}`,
    );
  }

  await stateModel.deleteOne({ state: receivedState });

  if (!code) {
    const errorMsg = "Authorization code missing in callback.";

    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-failed/${encodeURIComponent(
        errorMsg,
      )}`,
    );
  }

  const highLevel = new HighLevel({
    clientId: SUB_CLIENT_ID,
    clientSecret: SUB_CLIENT_SECRET,
  });

  try {
    const response = await highLevel.oauth.getAccessToken({
      client_id: SUB_CLIENT_ID,
      client_secret: SUB_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      user_type: "Location",
    });
    console.log({ response });

    const updateUser = await userModel.findById(userId);

    const subAccount = updateUser.ghlSubAccountIds.find(
      (acc) => acc.accountId === accountId,
    );

    // save agency id
    if (!subAccount) {
      throw Error("Cannot find Subaccount, please reinstall!");
    }

    if (accountId !== response.locationId) {
      throw Error("Account Cross-Breeding Not allowed!");
    }

    subAccount.ghlSubRefreshToken = response.refresh_token;
    subAccount.ghlSubRefreshTokenExpiry = new Date(
      Date.now() + response.expires_in * 1000,
    );

    await updateUser.save();

    const successMsg = "GHL Connection successful!";
    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-success/${encodeURIComponent(
        successMsg,
      )}`,
    );
  } catch (error) {
    console.error(
      "Token Exchange Error:",
      error.response ? error.response.data : error.message,
    );

    const errorMsg =
      error.message ||
      "Failed to exchange authorization code for access token.";

    return res.redirect(
      `${process.env.FRONTEND_URL}/connection-failed/${encodeURIComponent(
        errorMsg,
      )}`,
    );
  }
};

module.exports = {
  ghlAuthorize,
  ghlOauthCallback,
  ghlSubAuthorize,
  ghlSubOauthCallback,
  ghlSsoLoginHandler,
  stripeOauthCallback,
  testOpenAIKey,
  stripeAuthorize,
  testStripeToken,
  connectOpenAI,
  importGhlSubaccount,
  importGhlSubaccounts,
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
};
