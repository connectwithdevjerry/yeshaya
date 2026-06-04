const mongoose = require("mongoose");
const { db } = require("../db");

// Atomic sequence generator (used for invoice numbering)
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "invoice-2026"
  seq: { type: Number, default: 0 },
});

const counterModel = db.model("counter_collection", counterSchema);

// Returns the next sequence number atomically
const getNextSequence = async (key) => {
  const doc = await counterModel.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  return doc.seq;
};

module.exports = { counterModel, getNextSequence };
