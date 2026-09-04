// server/helpers/appointmentReminders.js
const cron = require("node-cron");
const appointmentModel = require("../model/appointment.model");
const userModel = require("../model/user.model");
const emailHelper = require("../resendObject");
const { createNotification } = require("../controller/notification.controller");
const { fmtWhen, reminderEmail } = require("./appointmentEmails");

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// Send a reminder for one appointment
const sendReminder = async (appt, whenLabel) => {
  let businessName = "us";
  try {
    const user = await userModel.findById(appt.userId).select("company");
    businessName = user?.company?.name || "us";
  } catch (_) {}

  const when = fmtWhen(appt.startTime);

  if (appt.customerEmail) {
    try {
      await emailHelper(
        appt.customerEmail,
        `Reminder: Your appointment ${whenLabel} — ${businessName}`,
        reminderEmail({ customerName: appt.customerName, when, businessName, whenLabel }),
      );
    } catch (e) { console.error("⚠️ reminder email failed:", e.message); }
  }

  await createNotification({
    userId: appt.userId,
    type: "general",
    title: "Appointment Reminder Sent",
    message: `Reminder (${whenLabel}) sent to ${appt.customerName || appt.customerEmail || "customer"} for ${when}.`,
    metadata: { appointmentId: appt._id, startTime: appt.startTime },
  });
};

// One sweep: find appointments due for a reminder and send
const runSweep = async () => {
  try {
    const now = Date.now();

    // 24-hour reminders: starts within the next 24h, not yet 24h-reminded
    const due24 = await appointmentModel.find({
      status: "booked",
      reminded24h: false,
      startTime: { $gt: new Date(now), $lte: new Date(now + 24 * HOUR) },
    });
    for (const appt of due24) {
      await sendReminder(appt, "in 24 hours");
      appt.reminded24h = true;
      // if it's also within 1h, mark that too to avoid double-send overlap
      if (new Date(appt.startTime).getTime() <= now + HOUR) {
        await sendReminder(appt, "in 1 hour");
        appt.reminded1h = true;
      }
      await appt.save();
    }

    // 1-hour reminders: starts within the next 1h, not yet 1h-reminded
    const due1 = await appointmentModel.find({
      status: "booked",
      reminded1h: false,
      startTime: { $gt: new Date(now), $lte: new Date(now + HOUR) },
    });
    for (const appt of due1) {
      await sendReminder(appt, "in 1 hour");
      appt.reminded1h = true;
      appt.reminded24h = true; // skip a now-irrelevant 24h reminder
      await appt.save();
    }

    if (due24.length || due1.length) {
      console.log(`⏰ appointment reminders → 24h:${due24.length} 1h:${due1.length}`);
    }
  } catch (err) {
    console.error("❌ appointment reminder sweep error:", err.message);
  }
};

// Start the cron job (every 15 minutes)
const startAppointmentReminders = () => {
  // node-cron needs a process that stays alive between ticks. On Vercel the
  // function is torn down after each request, so this never fired in
  // production. The sweep is reached over HTTP there instead (see
  // route/cron.route.js and vercel.json); this path is for a long-running host.
  if (process.env.VERCEL) {
    console.log("Serverless runtime detected — sweep runs via the cron endpoint, not node-cron.");
    return;
  }

  cron.schedule("*/15 * * * *", runSweep);
  console.log("⏰ Appointment reminder scheduler started (every 15m)");
  // run once shortly after boot to catch anything imminent
  setTimeout(runSweep, 30 * 1000);
};

module.exports = { startAppointmentReminders, runSweep };
