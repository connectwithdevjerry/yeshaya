const mongoose = require("mongoose");
const { db } = require("../db");

const stateSchema = mongoose.Schema({
  state: { type: String, required: true }, // state value
  cust_id: { type: String, required: false }, // customer id
  accountId: { type: String, required: false },
  installationType: String,
  dateCreated: { type: Date, immutable: true, default: () => Date.now() },
});

const stateModel = db.model("state_collection", stateSchema);
module.exports = stateModel;
