const { db } = require("../db");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {} = require("../constants");

const userSchema = mongoose.Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  stripePublishableKey: { type: String, required: false },
  stripeCustomerId: { type: String, required: false },
  stripeUserId: { type: String, required: false },
  stripeAccessToken: { type: String, required: false }, // does not expire
  openAIApiKey: { type: String, required: false },
  ghlAgencyId: { type: String, required: false },
  ghlSubAccountIds: [
    {
      accountId: String,
      connected: { type: Boolean, default: false },
      installationType: String,
      vapiAssistants: [{ assistantId: String, description: String }],
      numberDetails: [
        {
          phone: String,
          phoneId: String,
        },
      ],
    },
  ],
  ghlRefreshToken: { type: String, required: false },
  ghlRefreshTokenExpiry: { type: Date, required: false },
  companyName: { type: String, required: false },
  companyLogo: { type: String, default: "" },
  companyColorHex: { type: String, default: "" },
  documentationURL: { type: String, default: "" },
  phoneNumber: { type: String, required: false },
  address: { type: String, required: false },
  t_and_c: { type: Boolean, default: true },
  isActive: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false },
  dateCreated: { type: Date, immutable: true, default: () => Date.now() },
  dateUpdated: { type: Date, default: () => Date.now() },
  lastLogin: { type: Date, default: () => Date.now() },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      console.log({ err });
    } else {
      this.password = hash;
    }
    next();
  });
});

userSchema.methods.isValidPassword = async function (password) {
  if (!this.password || !password) return false;

  try {
    const isValid = await bcrypt.compare(password, this.password);
    return isValid;
  } catch (error) {
    throw error;
  }
};

const userModel = db.model("user_collection", userSchema);
module.exports = userModel;
