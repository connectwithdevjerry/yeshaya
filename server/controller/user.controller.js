const userModel = require("../model/user.model");
const JWT = require("jsonwebtoken");
const {
  signAccessToken,
  signRefreshToken,
  signForgotToken,
  verifyForgotToken,
  verifyRefreshToken,
} = require("../jwt_helpers");
const emailHelper = require("../resendObject");
const {
  authSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateCompanySchema,
} = require("../validation_schema");
const { REFRESH_TOKEN } = require("../constants");
const client = require("../jwt_db_access");
const { saveImageToDB } = require("../cloudinaryImageHandler");
const { default: axios } = require("axios");

const myPayload = (user) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  permissionLev: user.permissionLev,
  isActive: user.isActive,
  email: user.email,
  dateCreated: user.dateCreated,
  // Team context — lets middleware resolve the agency + role without a DB hit
  agencyOwnerId: user.agencyOwnerId ? user.agencyOwnerId.toString() : null,
  role: user.role || "owner",
});

const signup = async (req, res, next) => {
  // also signup, register
  try {
    const result = await signUpSchema.validateAsync(req.body);
    console.log({ result });

    const isUser = await userModel.findOne({ email: result.email });

    if (isUser)
      return res.send({ status: false, message: "Email already exist" });

    const user = await new userModel({
      ...result,
      // companyLogo: pic.secure_url,
    });
    const createdUser = await user.save();

    const token = await signForgotToken(result.email); // used to confirm user email address
    const reset_link = `${process.env.FRONTEND_URL}/confirm_email_address/${token}`;
    console.log({ token, reset_link });

    // let mailOptions = {
    //   from: process.env.MY_EMAIL_USER,
    //   to: result.email,
    //   subject: "Password Activation Link",
    //   text: `Your activation link: ${reset_link}`,
    // };

    // result.email,
    await emailHelper(
      result.email,
      "Password Activation Link",
      `Your activation link: <a href="${reset_link}">Click Here...</a>`,
    );

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log({ error });
    //     return res.send({
    //       status: false,
    //       message: "Failed to send confirmation email!",
    //     });
    //   }

    //   console.log("Email sent: " + info.response);

    //   return res.send({
    //     status: true,
    //     message: "Confirmation Link sent successfully",
    //     data: { ...createdUser.toObject(), password: undefined },
    //   });
    // });

    return res.send({
      status: true,
      message: "Confirmation Link sent successfully",
      data: { ...createdUser.toObject(), password: undefined },
    });
  } catch (error) {
    if (error.isJoi === true) {
      error.status = 422;
      console.log(error.message);
      return res.send({ status: false, message: error.message });
    }
    return res.send({ status: false, message: error.message });
  }
};

const signin = async (req, res, next) => {
  // also login, signin
  try {
    const result = await authSchema.validateAsync(req.body);
    const user = await userModel.findOne({ email: result.email });
    if (!user)
      return res.send({ status: false, message: "Email not registered!" });
    if (!user.isActive)
      return res.send({
        status: false,
        message:
          "Account not activated!, Click on the link sent to your mail on registration!",
      });

    const isMatch = await user.isValidPassword(result.password);

    console.log({ p: result.password });

    console.log({ isMatch });

    if (!isMatch)
      return res.send({
        status: false,
        message: "Password not valid",
      });

    const payload = myPayload(user);

    const accessToken = await signAccessToken(user.id, payload);
    const refreshToken = await signRefreshToken(user.id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.send({ status: true, accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true)
      return res.send({ status: false, message: "Invalid Username/Password" });
    next(error);
  }
};

const activateUser = async (req, res) => {
  const { token } = req.params;

  if (!token)
    return res.send({ Status: false, message: "You must suppy a token!" });

  try {
    const decoded = await verifyForgotToken(token);
    const user = await userModel.findOne({ email: decoded });

    if (!user)
      return res.send({ status: false, message: "Link does not exist!" });

    // user.isActive = true;
    const updateUser = await userModel.findOneAndUpdate(
      { email: decoded },
      { isActive: true },
      { new: true },
    );

    // console.log({ updateUser });

    res.send({ status: true, message: "You're now an active user!" });
  } catch (error) {
    console.log(error);
    res.send({ status: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordSchema.validateAsync(req.body);
    const email = result.email;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.send({ status: false, message: "User not found" });
    }
    const token = await signForgotToken(email);
    const reset_link = `${process.env.FRONTEND_URL}/resetpassword/${token}`;
    console.log({ token, reset_link });

    // let mailOptions = {
    //   from: process.env.MY_EMAIL_USER,
    //   to: email,
    //   subject: "Password Reset Link",
    //   text: `Your reset link: ${reset_link}`,
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log({ error });
    //     return res.send({ status: false, message: "Failed to send email" });
    //   }
    //   console.log("Email sent: " + info.response);
    //   res.send({ status: true, message: "Email sent successfully" });
    // });

    await emailHelper(
      email,
      "Password Reset Link",
      `Your reset link: <a href="${reset_link}">Click Here...</a>`,
    );

    return res.send({
      status: true,
      message: "Reset Link successfully sent to your mail!",
    });
  } catch (error) {
    // if (error.isJoi === true)
    return res.send({
      status: false,
      message: error.message || "Kindly provide a valid email/password",
    });

    // console.log(error.message);
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { newPassword, cnewPassword, token } =
      await resetPasswordSchema.validateAsync(req.body);

    if (newPassword !== cnewPassword)
      return res.send({ status: false, message: "Passwords do not match!" });

    const decoded = await verifyForgotToken(token);
    const user = await userModel.findOne({ email: decoded });

    // const password = await user.passwordResetHash(newPassword);

    if (!user)
      return res.send({ status: false, message: "Link does not exist!" });

    user.password = newPassword;
    user.isActive = true;

    await user.save();

    return res.send({ status: true, message: "Password updated successfully" });
  } catch (error) {
    if (error.isJoi === true) {
      error.status = 422;
      console.log(error.message);
      return res.send({ status: false, message: error.message });
    }
    return res.send({ status: false, message: error.message });
  }
};

const logout = async (req, res, next) => {
  try {
    // const { refreshToken } = req.body;
    const refreshToken = req.cookies?.refreshToken;

    console.log("Logging out user...");
    console.log({ refreshToken });
    console.log("req.cookies", req.cookies);

    if (!refreshToken)
      return res.send({
        status: false,
        message: "already logged out successful!",
      });

    const userId = await verifyRefreshToken(refreshToken);
    console.log({ userId });

    const isDeleted = client.deleteJWT(userId);

    if (!isDeleted) {
      console.log("Failed to delete refresh token");
      return res.send({
        status: false,
        message: "could not log out, try again later!",
      });
    }

    res.clearCookie(REFRESH_TOKEN, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.send({ status: true, message: "logout successful!" });
  } catch (error) {
    next(error);
  }
};

const exchangeToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // console.log({ refreshToken });

    if (!refreshToken)
      return res.send({
        status: false,
        message: "Refresh token not provided!",
      });
    const userId = await verifyRefreshToken(refreshToken);

    const user = await userModel.findById(userId);

    if (!user)
      return res.send({
        status: false,
        message: "User not found!",
      });

    const payload = myPayload(user);

    const accessToken = await signAccessToken(userId, payload);
    const refToken = await signRefreshToken(userId);

    res.cookie("refreshToken", refToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};

const updateCompanyDetails = async (req, res, next) => {
  try {
    // Validate only text fields
    const result = await updateCompanySchema.validateAsync(req.body, {
      abortEarly: false,
    });

    const user = await userModel.findById(req.user);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User does not exist",
      });
    }

    let uploadedLogo = null;

    if (req.file) {
      console.log("Uploading company logo...");

      uploadedLogo = await saveImageToDB(
        req.file.buffer,
        "brand-logo",
        "image",
      );
    }

    const company = user.company;

    Object.assign(company, result);

    if (uploadedLogo) {
      company.logoId = uploadedLogo.public_id;
      company.logo = uploadedLogo.secure_url;
    }

    await user.save();

    return res.json({
      status: true,
      message: "Company details updated successfully",
      data: company,
    });
  } catch (error) {
    if (error.isJoi) {
      return res.status(422).json({
        status: false,
        message: error.message,
      });
    }
  }
};

const getGhlTokens = async (userId) => {
  const user = await userModel.findById(userId);
  const refreshToken = user.ghlRefreshToken;

  try {
    const url = "https://services.leadconnectorhq.com/oauth/token";

    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const response = await axios.post(
      url,
      {
        client_id: process.env.GHL_APP_CLIENT_ID,
        client_secret: process.env.GHL_APP_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
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

const getGhlCompanyDetails = async (req, res, next) => {
  console.log("Getting company details...");
  try {
    const user = await userModel.findById(req.user);
    const agencyId = user.ghlAgencyId;
    const tokenResponse = await getGhlTokens(req.user);

    console.log({
      access_token: tokenResponse?.data?.access_token,
      tokenResponse,
    });

    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://services.leadconnectorhq.com/companies/${agencyId}`,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
      },
    };

    const response = await axios.request(config);

    console.log({ compD: response.data });

    return res.send({
      status: true,
      data: response.data,
    });
  } catch (error) {
    console.log("Error getting company details:", error.data);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const createCompanyDetails = async (req, res, next) => {
  console.log("Creating company...");

  const { name, phoneNum, address, website, industry } = req.body;

  try {
    let saveImage = null;

    if (req.file) {
      saveImage = await saveImageToDB(req.file.buffer, "company-logo", "image");
    }

    console.log({ saveImage });

    const user = await userModel.findById(req.user);
    const company = user.company;
    company.name = name;
    company.phoneNum = phoneNum;
    company.address = address;
    company.website = website;
    company.industry = industry;
    if (saveImage) {
      company.logoId = saveImage.public_id;
      company.logo = saveImage.secure_url;
    }
    await user.save();

    return res.send({
      status: true,
      data: company,
    });
  } catch (error) {
    console.log("Error creating company:", error.data);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const getCompanyDetails = async (req, res, next) => {
  console.log("Getting company details...");
  try {
    const user = await userModel.findById(req.user);

    company = user.company;

    return res.send({
      status: true,
      data: { ...company.toObject(), agencyId: user.ghlAgencyId },
    });
  } catch (error) {
    console.log("Error getting company details:", error.data);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    // Profile is the acting person's own details, not the agency owner's
    const user = await userModel.findById(req.actingUserId || req.user);

    return res.send({
      status: true,
      data: {
        email:       user.email,
        phoneNumber: user.phoneNumber,
        firstName:   user.firstName,
        lastName:    user.lastName,
        role:        user.role || "owner",
        isOwner:     !user.agencyOwnerId,
      },
    });
  } catch (error) {
    console.log("Error getting user details:", error.data);
    return res.send({
      status: false,
      message: error.message,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.actingUserId || req.user; // edit your OWN profile
    const { firstName, lastName, phoneNumber } = req.body;

    console.log("🔄 updateUserProfile → userId:", userId, "| body:", req.body);

    if (!firstName || !firstName.trim()) {
      console.warn("⚠️ updateUserProfile → firstName missing");
      return res.status(400).json({ status: false, message: "First name is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      console.warn("⚠️ updateUserProfile → user not found:", userId);
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (firstName   !== undefined) user.firstName   = firstName.trim();
    if (lastName    !== undefined) user.lastName    = lastName.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();

    await user.save();

    const responseData = {
      email:       user.email,
      firstName:   user.firstName,
      lastName:    user.lastName,
      phoneNumber: user.phoneNumber,
    };

    console.log("✅ updateUserProfile → saved successfully:", responseData);

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("❌ updateUserProfile error:", error.message, error.stack);
    return res.status(500).json({ status: false, message: "Failed to update profile" });
  }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Request an email change → verification link to the NEW email ─────────────
const requestEmailChange = async (req, res) => {
  try {
    const userId = req.actingUserId || req.user;
    const { newEmail, password } = req.body;

    if (!newEmail || !EMAIL_RE.test(newEmail.trim())) {
      return res.status(400).json({ status: false, message: "A valid new email is required" });
    }
    if (!password) {
      return res.status(400).json({ status: false, message: "Your current password is required" });
    }

    const normalized = newEmail.trim().toLowerCase();
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    if (normalized === (user.email || "").toLowerCase()) {
      return res.status(400).json({ status: false, message: "That's already your current email" });
    }

    // Re-authenticate
    const ok = await user.isValidPassword(password);
    if (!ok) return res.status(401).json({ status: false, message: "Incorrect password" });

    // New email must be free
    const taken = await userModel.findOne({ email: normalized });
    if (taken) return res.status(400).json({ status: false, message: "That email is already in use" });

    // Signed token carrying who + the new email (30 min)
    const token = JWT.sign(
      { userId: userId.toString(), newEmail: normalized },
      process.env.FORGOT_TOKEN_SECRET,
      { expiresIn: "30m" },
    );

    const link = `${process.env.FRONTEND_URL}/confirm-email-change/${token}`;
    await emailHelper(
      normalized,
      "Confirm your new email address",
      `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2 style="color:#111827">Confirm your email change</h2>
          <p style="color:#6B7280">Click below to set <strong>${normalized}</strong> as your new login email. This link expires in 30 minutes.</p>
          <a href="${link}" style="display:inline-block;background:#6366F1;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Confirm New Email</a>
          <p style="color:#9CA3AF;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    );

    console.log(`✅ requestEmailChange → verification sent to ${normalized} for user ${userId}`);
    return res.status(200).json({ status: true, message: `Verification sent to ${normalized}` });
  } catch (error) {
    console.error("❌ requestEmailChange error:", error.message);
    return res.status(500).json({ status: false, message: "Failed to request email change" });
  }
};

// ─── Change password (logged-in, re-auth required) ───────────────────────────
const changePassword = async (req, res) => {
  try {
    const userId = req.actingUserId || req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: false, message: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ status: false, message: "New password must be at least 6 characters" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const ok = await user.isValidPassword(currentPassword);
    if (!ok) return res.status(401).json({ status: false, message: "Current password is incorrect" });

    if (await user.isValidPassword(newPassword)) {
      return res.status(400).json({ status: false, message: "New password must be different from the current one" });
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    console.log(`✅ changePassword → updated for user ${userId}`);
    return res.status(200).json({ status: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ changePassword error:", error.message);
    return res.status(500).json({ status: false, message: "Failed to change password" });
  }
};

// ─── Confirm the email change (public — token-gated) ──────────────────────────
const confirmEmailChange = async (req, res) => {
  try {
    const { token } = req.params;
    let payload;
    try {
      payload = JWT.verify(token, process.env.FORGOT_TOKEN_SECRET);
    } catch (_) {
      return res.status(400).json({ status: false, message: "This link is invalid or has expired" });
    }

    const { userId, newEmail } = payload;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    // Re-check it's still free
    const taken = await userModel.findOne({ email: newEmail, _id: { $ne: userId } });
    if (taken) return res.status(400).json({ status: false, message: "That email is now in use by another account" });

    user.email = newEmail;
    await user.save();

    console.log(`✅ confirmEmailChange → user ${userId} email updated to ${newEmail}`);
    return res.status(200).json({ status: true, message: "Your email has been updated", email: newEmail });
  } catch (error) {
    console.error("❌ confirmEmailChange error:", error.message);
    return res.status(500).json({ status: false, message: "Failed to confirm email change" });
  }
};

/* ─────────────────────────────────────────────
   DOMAIN SETTINGS
───────────────────────────────────────────── */
const getDomainSettings = async (req, res) => {
  try {
    const user = await userModel.findById(req.user);
    const wl = user.whiteLabel || {};
    return res.send({
      status: true,
      data: {
        domainName:   wl.domainName   || "",
        domainStatus: wl.domainStatus || "not_configured",
        record: {
          type:  wl.recordType  || "A",
          name:  wl.recordName  || "@",
          value: wl.recordValue || "76.76.21.21",
        },
      },
    });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const saveDomainSettings = async (req, res) => {
  try {
    const { domainName, recordType, recordName, recordValue } = req.body;
    const user = await userModel.findById(req.user);
    user.whiteLabel.domainName   = domainName   || user.whiteLabel.domainName;
    user.whiteLabel.recordType   = recordType   || user.whiteLabel.recordType;
    user.whiteLabel.recordName   = recordName   || user.whiteLabel.recordName;
    user.whiteLabel.recordValue  = recordValue  || user.whiteLabel.recordValue;
    user.whiteLabel.domainStatus = "not_configured"; // reset on save; verify separately
    await user.save();
    return res.send({ status: true, message: "Domain settings saved" });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const verifyDomain = async (req, res) => {
  try {
    const dns = require("dns").promises;
    const user = await userModel.findById(req.user);
    const { domainName, recordValue } = user.whiteLabel;

    if (!domainName) {
      return res.send({ status: false, message: "No domain configured" });
    }

    let resolved = false;
    try {
      const addresses = await dns.resolve4(domainName);
      resolved = addresses.includes(recordValue || "76.76.21.21");
    } catch (_) {
      resolved = false;
    }

    if (resolved) {
      user.whiteLabel.domainStatus = "active";
      await user.save();
      return res.send({ status: true, domainStatus: "active", message: "Domain verified successfully" });
    } else {
      return res.send({ status: true, domainStatus: "not_configured", message: "DNS records not yet propagated" });
    }
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   SNAPSHOT SETTINGS
───────────────────────────────────────────── */
const getSnapshot = async (req, res) => {
  try {
    const user = await userModel.findById(req.user);
    return res.send({ status: true, data: user.snapshot || {} });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const saveSnapshot = async (req, res) => {
  try {
    const { features, rebilling, resources, limits } = req.body;
    const user = await userModel.findById(req.user);

    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    console.log("🔄 saveSnapshot → userId:", req.user, "| body:", req.body);

    // Initialise snapshot if it doesn't exist yet
    if (!user.snapshot) user.snapshot = {};

    // Safe spread merge — avoids crash if sub-object is undefined on fresh accounts
    if (features !== undefined)
      user.snapshot.features   = { ...(user.snapshot.features  || {}), ...features   };
    if (rebilling !== undefined)
      user.snapshot.rebilling  = { ...(user.snapshot.rebilling || {}), ...rebilling  };
    if (resources !== undefined)
      user.snapshot.resources  = resources;
    if (limits !== undefined)
      user.snapshot.limits     = { ...(user.snapshot.limits    || {}), ...limits     };

    user.markModified("snapshot");
    await user.save();

    console.log("✅ saveSnapshot → saved:", user.snapshot);
    return res.status(200).json({ status: true, message: "Snapshot settings saved", data: user.snapshot });
  } catch (error) {
    console.error("❌ saveSnapshot error:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN SETTINGS
───────────────────────────────────────────── */
const getAdminSettings = async (req, res) => {
  try {
    const user = await userModel.findById(req.user);
    return res.send({
      status: true,
      data: {
        hasAdminPassword:  !!user.adminLockPassword,
        resendConfigured:  !!user.resendApiKey,
      },
    });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

const saveAdminSettings = async (req, res) => {
  try {
    const { adminLockPassword, resendApiKey } = req.body;
    const user = await userModel.findById(req.user);

    if (adminLockPassword !== undefined) user.adminLockPassword = adminLockPassword;
    if (resendApiKey      !== undefined) user.resendApiKey      = resendApiKey;

    await user.save();
    return res.send({ status: true, message: "Admin settings saved" });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

module.exports = {
  signup,
  signin,
  forgotPassword,
  handleResetPassword,
  logout,
  activateUser,
  exchangeToken,
  getCompanyDetails,
  createCompanyDetails,
  updateCompanyDetails,
  getUserDetails,
  updateUserProfile,
  requestEmailChange,
  confirmEmailChange,
  changePassword,
  getDomainSettings,
  saveDomainSettings,
  verifyDomain,
  getSnapshot,
  saveSnapshot,
  getAdminSettings,
  saveAdminSettings,
};
