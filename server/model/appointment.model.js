const mongoose = require("mongoose");
const { db } = require("../db");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user_collection",
      required: true,
      index: true,
    },
    subaccountId: { type: String, index: true },
    calendarId:   { type: String },
    ghlEventId:   { type: String },
    ghlContactId: { type: String },

    customerName:  { type: String, default: "" },
    customerEmail: { type: String, default: "" },

    startTime: { type: Date, required: true, index: true },
    title:     { type: String, default: "" },

    // Reminder tracking
    reminded24h: { type: Boolean, default: false },
    reminded1h:  { type: Boolean, default: false },

    status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
  },
  { timestamps: true },
);

appointmentSchema.index({ startTime: 1, status: 1 });

const appointmentModel = db.model("appointment_collection", appointmentSchema);
module.exports = appointmentModel;
