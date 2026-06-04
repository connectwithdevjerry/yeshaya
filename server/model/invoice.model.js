const mongoose = require("mongoose");
const { db } = require("../db");

const lineItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    type:        { type: String },          // e.g. "voice", "sms"
    quantity:    { type: Number, default: 0 },
    unitAmount:  { type: Number, default: 0 }, // average per-unit (informational)
    amount:      { type: Number, default: 0 }, // line total
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true }, // "INV-2026-0001"
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_collection",
      required: true,
      index: true,
    },
    kind: { type: String, enum: ["agency", "rebilling"], default: "agency" },
    subaccountId: { type: String, default: null }, // set for rebilling invoices
    status: {
      type: String,
      enum: ["issued", "paid", "void"],
      default: "issued",
    },
    periodStart: { type: Date, required: true },
    periodEnd:   { type: Date, required: true },

    lineItems:    [lineItemSchema],
    usageTotal:   { type: Number, default: 0 }, // sum of usage charges
    paymentsTotal:{ type: Number, default: 0 }, // sum of top-ups in period
    total:        { type: Number, default: 0 }, // = usageTotal (amount billed)
    currency:     { type: String, default: "USD" },

    // Billing entity snapshot (so the invoice is immutable even if company changes)
    billedTo: {
      name:    String,
      email:   String,
      address: String,
    },

    pdfUrl:    { type: String, default: "" }, // Cloudinary link
    issuedAt:  { type: Date, default: Date.now },
    emailedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

invoiceSchema.index({ userId: 1, createdAt: -1 });

const invoiceModel = db.model("invoice_collection", invoiceSchema);
module.exports = invoiceModel;
