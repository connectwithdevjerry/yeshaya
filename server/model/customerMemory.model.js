const mongoose = require("mongoose");

// Durable, per-customer memory for an agency's assistants.
//
// One document per (agency owner, sub-account, customer identity). The identity
// is a normalized phone number, email, or — for anonymous website visitors — a
// widget-scoped visitor id, so the same person is recognised whether they call,
// text, or type into the embedded widget.
//
// Memory is deliberately scoped to the SUB-ACCOUNT, not to a single assistant:
// a caller who books with the receptionist assistant and then reaches the
// support assistant is still the same customer of the same business. Every turn
// and fact records the assistantId that produced it, so provenance is kept and
// a per-assistant view can be filtered out of this same collection.

// A single durable fact ("prefers morning appointments", "drives a 2019 Civic").
const factSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    value: { type: String, default: "" },
    source: { type: String, default: "" }, // call | chat | sms | widget | tool | manual
    assistantId: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

// A single conversational turn, on any channel.
const turnSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, default: "" },
    channel: { type: String, default: "" }, // call | chat | sms | widget
    assistantId: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

// One completed interaction (a call, a chat session, an SMS exchange).
const interactionSchema = new mongoose.Schema(
  {
    channel: { type: String, default: "" },
    assistantId: { type: String, default: "" },
    refId: { type: String, default: "" }, // Vapi call/chat id — also the dedupe key
    summary: { type: String, default: "" },
    durationSec: { type: Number },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const customerMemorySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_collection",
      required: true,
      index: true,
    },
    subaccountId: { type: String, default: "" },

    // Normalized identity — "phone:+15551234567", "email:a@b.com",
    // "visitor:wgt_abc:9f3e…", or "user:<mongoId>" for dashboard Chat Lab tests.
    identityKey: { type: String, required: true },

    // Best-known contact details, filled in as channels reveal them.
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    ghlContactId: { type: String, default: "" },

    // Rolling natural-language summary of everything before the kept turns.
    summary: { type: String, default: "" },

    facts: { type: [factSchema], default: [] },
    turns: { type: [turnSchema], default: [] },
    interactions: { type: [interactionSchema], default: [] },

    channels: { type: [String], default: [] },
    interactionCount: { type: Number, default: 0 },
    lastAssistantId: { type: String, default: "" },
    lastInteractionAt: { type: Date },

    // Set from the dashboard to stop recording and stop injecting memory for
    // this customer, without deleting what is already there.
    optedOut: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// One memory per customer per sub-account.
customerMemorySchema.index(
  { ownerUserId: 1, subaccountId: 1, identityKey: 1 },
  { unique: true },
);

// Supports the dashboard's "most recently active customers" listing.
customerMemorySchema.index({ ownerUserId: 1, subaccountId: 1, lastInteractionAt: -1 });

module.exports = mongoose.model("customerMemory", customerMemorySchema);
