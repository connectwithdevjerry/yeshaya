// Scheduled sweeps, reachable over HTTP.
//
// These used to run under node-cron inside the server process. On Vercel there
// is no such process — the function is torn down after each request — so
// neither sweep had ever fired in production: no appointment reminders, and no
// daily check for calendars that had silently stopped working.
//
// Vercel Cron (see vercel.json) calls this route on a schedule instead. Both
// entries there are daily, because Vercel's Hobby plan rejects anything more
// frequent at deploy time and a schedule that will not deploy is worse than one
// that runs less often. On Pro, change /cron/reminders to "0 * * * *": the
// one-hour reminder needs an hourly sweep to be worth anything. Any external
// scheduler can call this route too, which is the other way to get there.
const express = require("express");
const router = express.Router();

const { runSweep: runReminderSweep } = require("../helpers/appointmentReminders");
const { runSweep: runCalendarSweep } = require("../helpers/calendarHealth");

// Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. A `key` query
// parameter is accepted too, for schedulers that cannot set headers.
//
// With no CRON_SECRET configured the route refuses everything rather than
// running unauthenticated: these sweeps send mail to real customers.
const authorised = (req) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return bearer === secret || req.query.key === secret;
};

const SWEEPS = {
  reminders: runReminderSweep,
  calendars: runCalendarSweep,
};

router.all("/:sweep", async (req, res) => {
  if (!authorised(req)) {
    if (!process.env.CRON_SECRET) {
      console.error("Cron endpoint called but CRON_SECRET is not set — refusing.");
    }
    return res.status(401).json({ status: false, message: "Unauthorized" });
  }

  const sweep = SWEEPS[req.params.sweep];
  if (!sweep) {
    return res.status(404).json({ status: false, message: `Unknown sweep: ${req.params.sweep}` });
  }

  const startedAt = Date.now();
  try {
    // Awaited, not detached: on this runtime anything still running when the
    // response goes out is simply dropped.
    await sweep();
    const ms = Date.now() - startedAt;
    console.log(`⏰ ${req.params.sweep} sweep finished in ${ms}ms`);
    return res.json({ status: true, sweep: req.params.sweep, ms });
  } catch (error) {
    console.error(`❌ ${req.params.sweep} sweep failed:`, error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
