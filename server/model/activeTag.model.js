const mongoose = require("mongoose");

// An "Active Tag" — a named tag the agency defines for a sub-account, optionally
// linked to an assistant, with an instruction describing when it should be applied.
// The assistant applies it to a contact during calls via the add_tag tool.
const activeTagSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    subaccountId:  { type: String, required: true, index: true },
    name:          { type: String, required: true },
    assistantId:   { type: String, default: "" },
    assistantName: { type: String, default: "" },
    instruction:   { type: String, default: "" }, // when should the AI apply this tag
  },
  { timestamps: true },
);

module.exports = mongoose.model("activeTag", activeTagSchema);
