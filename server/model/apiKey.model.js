const mongoose = require("mongoose");

// Customer-facing API keys. We store only a SHA-256 hash of the key plus a
// display prefix — the full key is shown to the user exactly once at creation.
const apiKeySchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    name:       { type: String, default: "API Key" },
    keyPrefix:  { type: String, required: true },              // e.g. "sk_live_a1b2c3d4…"
    hashedKey:  { type: String, required: true, index: true }, // sha256(fullKey)
    lastUsedAt: { type: Date, default: null },
    revoked:    { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("apiKey", apiKeySchema);
