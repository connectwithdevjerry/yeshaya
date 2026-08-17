const { db } = require("../db");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {} = require("../constants");

const userSchema = mongoose.Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  // ── Team / multi-user ──
  agencyOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user_collection",
    default: null, // null = this user is an agency owner; set = team member
  },
  role: {
    type: String,
    enum: ["owner", "admin", "member", "viewer"],
    default: "owner",
  },
  isActive: { type: Boolean, default: true },
  teamInvites: [
    {
      email:     { type: String, required: true },
      role:      { type: String, enum: ["admin", "member", "viewer"], default: "member" },
      token:     { type: String, required: true },
      status:    { type: String, enum: ["pending", "accepted", "cancelled"], default: "pending" },
      invitedAt: { type: Date, default: Date.now },
    },
  ],
  stripePublishableKey: { type: String, required: false },
  stripeCustomerId: { type: String, required: false },
  stripeUserId: { type: String, required: false },
  stripeAccessToken: { type: String, required: false }, // does not expire
  openAIApiKey: { type: String, required: false },
  ghlAgencyId: { type: String, required: false },
  walletBalance: { type: Number, default: 10 },
  autoCardPay: {
    status: { type: Boolean, default: true },
    least: { type: Number, default: 25 },
    refillAmount: { type: Number, default: 50 },
  },
  allKnowledgeBaseToolIds: [String],
  ghlSubAccountIds: [
    {
      accountId:              String,
      ghlSubRefreshToken:     String,
      ghlSubRefreshTokenExpiry: Date,
      ghlSubAccessToken:      String,
      ghlSubAccessTokenExpiry: Date,
      connected:              { type: Boolean, default: false },
      isFavorite:             { type: Boolean, default: false },
      isArchived:             { type: Boolean, default: false },
      customName:             { type: String,  default: ""    },
      notes:                  { type: String,  default: ""    },
      subAccountKnowledgeBaseToolIds: [String],
      numberPools: [
        {
          poolId:     { type: String, required: true },
          name:       { type: String, default: "Untitled Pool" },
          numberSids: [String], // phoneSids assigned to this pool
          createdAt:  { type: Date, default: Date.now },
        },
      ],
      savedContacts: [
        {
          firstName: String,
          email: String,
          phone: String,
          lastName: String,
          linkedIn: String,
          company: String,
          title: String,
        },
      ],
      installationType: String,
      vapiAssistants: [
        {
          assistantId: String,
          description: String,
          clonedFrom: String, // source assistant id when created from a snapshot resource
          favorite: { type: Boolean, default: false },
          archived: { type: Boolean, default: false },
          calendar: { type: String, required: false },
          teamNotes: { type: String, required: false },
          inboundDynamicMessage: { type: String, required: false },
          outboundDynamicMessage: { type: String, required: false },
          knowledgeBaseToolIds: [String],
          connectedTools: [String],
          customFieldMap: [
            {
              id: String,         // GHL custom field id
              name: String,
              fieldKey: String,
              dataType: String,
              instruction: String,
            },
          ],
          numberDetails: [
            {
              phoneNum: String,
              vapiPhoneNumId: String,
              phoneSid: String,
            },
          ],
        },
      ],
      // External (BYO/SIP) numbers imported into Vapi — live at the sub-account level
      byoNumbers: [
        {
          phoneNumber: String,
          vapiPhoneNumId: String,
          credentialId: String,
          terminationUri: String,
          friendlyName: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  ],
  ghlRefreshToken: { type: String, required: false },
  ghlRefreshTokenExpiry: { type: Date, required: false },
  billingEvents: [
    {
      callId: String,
      type: { type: String },
      amount: Number,
      phoneSid: String, // set on call charges to track per-number limits
      subaccountId: String, // owning sub-account — used for snapshot usage caps
      durationSec: Number, // call duration in seconds — used for call-minute caps
      processedAt: { type: Date, default: Date.now },
    },
  ],
  whiteLabel: {
    recordType:   { type: String },
    recordName:   { type: String },
    recordValue:  { type: String },
    domainName:   { type: String, default: "" },
    domainStatus: { type: String, default: "not_configured" }, // "not_configured" | "pending" | "active"
    verification: { type: mongoose.Schema.Types.Mixed, default: null }, // Vercel-required DNS records
  },
  snapshot: {
    features: {
      voice:  { type: Boolean, default: true  },
      chat:   { type: Boolean, default: true  },
      kb:     { type: Boolean, default: false },
      phones: { type: Boolean, default: true  },
    },
    rebilling: {
      voice: { enabled: { type: Boolean, default: false }, price: { type: String, default: "" } },
      chat:  { enabled: { type: Boolean, default: false }, price: { type: String, default: "" } },
      kb:    { enabled: { type: Boolean, default: false }, price: { type: String, default: "" } },
      phone: { enabled: { type: Boolean, default: false }, price: { type: String, default: "" } },
    },
    resources: [{ type: String }],
    limits: {
      assistants: { enabled: { type: Boolean, default: false }, value: { type: String, default: "" } },
      messages:   { enabled: { type: Boolean, default: false }, value: { type: String, default: "" } },
      calling:    { enabled: { type: Boolean, default: false }, value: { type: String, default: "" } },
      phones:     { enabled: { type: Boolean, default: false }, value: { type: String, default: "" } },
    },
  },
  adminLockPassword: { type: String, default: "" }, // bcrypt-hashed
  resendApiKey:      { type: String, default: "" },
  resendFromEmail:   { type: String, default: "" }, // white-label sender, e.g. "Acme <noreply@acme.com>"
  company: {
    name: { type: String, required: false },
    logoId: { type: String, required: false },
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
