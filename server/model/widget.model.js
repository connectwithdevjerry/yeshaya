const mongoose = require("mongoose");
const crypto = require("crypto");

// An embeddable chat widget tied to a single Vapi assistant. The agency creates
// one from the dashboard, copies the <script> snippet, and pastes it on any
// external website. Visitors there text-chat with the linked assistant; usage is
// billed to the owning agency's wallet (subject to feature/usage-cap gates).
const widgetSchema = new mongoose.Schema(
  {
    ownerUserId:   { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    subaccountId:  { type: String, default: "" },
    publicId:      { type: String, unique: true, index: true }, // exposed in the embed snippet
    name:          { type: String, required: true },
    assistantId:   { type: String, required: true },
    assistantName: { type: String, default: "" },
    theme: {
      primaryColor: { type: String, default: "#6366f1" },
      position:     { type: String, default: "bottom-right" }, // bottom-right | bottom-left
      title:        { type: String, default: "Chat with us" },
      greeting:     { type: String, default: "Hi! How can I help you today?" },
      launcherText: { type: String, default: "" }, // optional label shown beside the bubble
    },
    allowedDomains: { type: [String], default: [] }, // empty = allow any domain
    active:   { type: Boolean, default: true },
    favorite: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Generate a hard-to-guess public id once, before first validation/save.
widgetSchema.pre("validate", function (next) {
  if (!this.publicId) {
    this.publicId = "wgt_" + crypto.randomBytes(9).toString("hex");
  }
  next();
});

module.exports = mongoose.model("widget", widgetSchema);
