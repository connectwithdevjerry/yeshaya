const mongoose = require("mongoose");

// One record per knowledge-base upload. Mirrors the Vapi query tool but keeps
// our own metadata + (for real files) the original asset persisted to Cloudinary.
const kbFileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    subaccountId: { type: String, default: "", index: true }, // GHL locationId; "" = agency-level

    toolId: { type: String, required: true, index: true }, // Vapi query tool id
    vapiFileId: { type: String, default: "" }, // Vapi file id

    title: { type: String, default: "" },
    type: { type: String, enum: ["file", "url", "text", "faq"], default: "file" },

    // File-specific metadata (empty for text/faq/url)
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },

    // Persisted original (Cloudinary raw upload) — only for type === "file"
    cloudinaryUrl: { type: String, default: "" },
    cloudinaryPublicId: { type: String, default: "" },

    // For text/faq/url types we keep the source so it can be previewed inline
    sourceText: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },

    extractedChars: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ["ready", "processing", "error"], default: "ready" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("kbFile", kbFileSchema);
