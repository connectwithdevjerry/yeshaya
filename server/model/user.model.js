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
  walletBalance: { type: Number, default: 10 },
  autoCardCharging: { type: Boolean, default: false },
  allKnowledgeBaseToolIds: [String],
  ghlSubAccountIds: [
    {
      accountId: String,
      ghlSubRefreshToken: String,
      ghlSubRefreshTokenExpiry: Date,
      connected: { type: Boolean, default: false },
      installationType: String,
      vapiAssistants: [
        {
          assistantId: String,
          description: String,
          calendar: { type: String, required: false },
          inboundDynamicMessage: { type: String, required: false },
          outboundDynamicMessage: { type: String, required: false },
          knowledgeBaseToolIds: [String],
          connectedTools: [String],
          numberDetails: [
            {
              phoneNum: String,
              vapiPhoneNumId: String,
              phoneSid: String,
            },
          ],
        },
      ],
    },
  ],
  ghlRefreshToken: { type: String, required: false },
  ghlRefreshTokenExpiry: { type: Date, required: false },
  billingEvents: [
    {
      callId: String,
      type: { type: String, enum: ["call.ended", "call.analysis.completed"] },
      amount: Number,
      processedAt: { type: Date, default: Date.now },
    },
  ],
  whiteLabel: {
    recordType: { type: String },
    recordName: { type: String },
    recordValue: { type: String },
  },
  company: {
    name: { type: String, required: false },
    website: { type: String, required: false },
    industry: { type: String, required: false },
    logo: { type: String, default: "" },
    phoneNum: { type: String, required: false },
    address: { type: String, required: false },
    hex: { type: String, default: "" },
    documentationURL: { type: String, default: "" },
  },
  phoneNumber: { type: String, required: false },
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
