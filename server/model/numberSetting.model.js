const mongoose = require("mongoose");

// Per-phone-number settings owned by a user. Keyed by the Twilio phone SID.
// NOTE: limits/permissions persist here as configuration; enforcement in call
// routing is a separate follow-up.
const numberSettingSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    phoneSid:{ type: String, required: true, index: true },

    label: { type: String, default: "" },
    notes: { type: String, default: "" },

    limits: {
      maxCallsPerDay: { type: Number, default: 0 }, // 0 = unlimited
      monthlyBudget:  { type: Number, default: 0 }, // 0 = unlimited (USD)
    },

    permissions: {
      allowedRoles: { type: [String], default: ["owner", "admin", "member"] },
    },
  },
  { timestamps: true },
);

numberSettingSchema.index({ userId: 1, phoneSid: 1 }, { unique: true });

module.exports = mongoose.model("numberSetting", numberSettingSchema);
