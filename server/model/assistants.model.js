const { db } = require("../db");
const mongoose = require("mongoose");

const assistantSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user_collection", required: true },
  assistant: { type: String, required: true, unique: true },
  dateCreated: { type: Date, immutable: true, default: () => Date.now() },
  dateUpdated: { type: Date, default: () => Date.now() },
});

const assistantModel = db.model("assistant_collection", assistantSchema);
module.exports = assistantModel;