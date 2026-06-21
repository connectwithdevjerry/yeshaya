const mongoose = require("mongoose");

// One webhook configuration per user. Events are delivered as signed HTTP POSTs
// to endpointUrl when matching activity occurs.
const webhookSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, unique: true, index: true },
    endpointUrl: { type: String, default: "" },
    active:      { type: Boolean, default: true },
    secret:      { type: String, default: "" }, // HMAC signing secret
    events: {
      calls:    { type: Boolean, default: false },
      payments: { type: Boolean, default: false },
      contacts: { type: Boolean, default: false },
      account:  { type: Boolean, default: false }, // assistants, KB, numbers, sub-accounts
      all:      { type: Boolean, default: false }, // everything (catch-all)
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("webhook", webhookSchema);
