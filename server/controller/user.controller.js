const userModel = require("../model/user.model");
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
    emailHelper(
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
    next(error);
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

    emailHelper(
      email,
      "Password Reset Link",
      `Your reset link: <a href="${reset_link}">Click Here...</a>`,
    );

    return res.send({
      status: true,
      message: "Reset Link successfully sent to your mail!",
    });
  } catch (error) {
    if (error.isJoi === true)
      return res.send({
        status: false,
        message: "Kindly provide a valid email/password",
      });

    console.log(error);
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
};
