const Joi = require("@hapi/joi");

const authSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).required(),
});

const signUpSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  // phoneNumber: Joi.string().required(),
  // address: Joi.string().required(),
  // companyLogo: Joi.string().base64().required(),
  // t_and_c: Joi.boolean().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().min(10).required("token is required"),
  newPassword: Joi.string().min(5).required("new password is required"),
  cnewPassword: Joi.string()
    .min(5)
    .required("confirm new password is required"),
});

module.exports = {
  authSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
