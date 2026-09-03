const mongoose = require("mongoose");

// One row per money movement on an agency's wallet.
//
// These used to live in an unbounded `billingEvents` array on the user
// document, which grew forever against Mongo's 16MB per-document limit and
// forced every usage check to load and scan the whole history in memory. They
// are now their own collection so usage can be aggregated in the database and
// the user document stays small.
//
// Amount convention: POSITIVE for money added to the wallet (top-ups),
// NEGATIVE for money spent (usage). The legacy embedded array stored usage as
// a positive number and relied on the `type` to know the direction; readers
// normalise both shapes.

const billingEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_collection",
      required: true,
      index: true,
    },

    // "end-of-call-report" | "call.ended" | "call.analysis.completed"
    // | "chat_message" | "SMS_CHARGE"
    // | "WALLET_TOPUP" | "AUTO_WALLET_TOPUP" | "WALLET_TOPUP_FAILED"
    type: { type: String, required: true },

    amount: { type: Number, required: true, default: 0 },

    // What the provider actually cost, and the platform fee added on top. Kept
    // separately so margin is a direct sum over these rows rather than
    // something that has to be re-derived from prices later.
    rawAmount: { type: Number },
    platformFee: { type: Number, default: 0 },

    callId: { type: String, default: "" }, // Vapi call/chat id, or Stripe PI id
    subaccountId: { type: String, default: "" }, // enables per-sub-account caps
    phoneSid: { type: String, default: "" }, // enables per-number budgets
    durationSec: { type: Number },

    // Set for anything with a natural identity, so a retried webhook cannot
    // charge twice. Absent for events that have no stable id.
    idempotencyKey: { type: String },

    processedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

// The idempotency guarantee: one row per (agency, natural key). Partial so
// events without a key are still allowed.
billingEventSchema.index(
  { userId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } },
);

// Usage rollups: "this agency, this sub-account, this month".
billingEventSchema.index({ userId: 1, subaccountId: 1, processedAt: -1 });
// Per-number budgets and daily call counts.
billingEventSchema.index({ userId: 1, phoneSid: 1, processedAt: -1 });

module.exports = mongoose.model("billingEvent", billingEventSchema);
