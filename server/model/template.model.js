const mongoose = require("mongoose");
const { db } = require("../db");

const variableSchema = new mongoose.Schema(
  {
    key:          { type: String, required: true },
    label:        { type: String, default: "" },
    defaultValue: { type: String, default: "" },
  },
  { _id: false },
);

const versionSchema = new mongoose.Schema(
  {
    promptBody: String,
    variables:  [variableSchema],
    savedAt:    { type: Date, default: Date.now },
  },
  { _id: true },
);

const templateSchema = new mongoose.Schema(
  {
    // Agency owner. null = platform-provided system/starter template.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_collection",
      default: null,
      index: true,
    },
    name:        { type: String, required: true },
    description: { type: String, default: "" },
    category:    { type: String, default: "Custom" },
    promptBody:  { type: String, default: "" },
    variables:   [variableSchema],

    isSystem: { type: Boolean, default: false }, // starter templates
    isShared: { type: Boolean, default: false }, // future marketplace

    versions: [versionSchema], // edit history
  },
  { timestamps: true },
);

const templateModel = db.model("template_collection", templateSchema);
module.exports = templateModel;
