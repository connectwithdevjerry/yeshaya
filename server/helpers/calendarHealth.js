// Proactive booking-calendar health checks.
//
// A calendar linked to an assistant can stop working without anything in this
// app noticing: it gets deleted, unshared or reassigned in GoHighLevel, or the
// sub-account's connection expires. Nothing verified it, so the first sign of
// trouble was a caller asking for an appointment and the assistant being unable
// to answer.
//
// Deliberately NOT checked at call time: verifying against GoHighLevel means a
// round-trip on the path between a call arriving and being answered, which is
// the latency the caller hears as silence. This runs on a schedule instead, and
// a live tool call that hits the problem reports it immediately (see
// reportCalendarProblem).

const cron = require("node-cron");
const axios = require("axios");
const userModel = require("../model/user.model");
const { createNotification } = require("../controller/notification.controller");
const { getSubGhlTokens } = require("../helperFunctions");

// GoHighLevel is a third party and this is a background sweep: keep it gentle.
const CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 10_000;

// One problem per assistant per day at most. Without this a broken calendar
// would notify on every sweep and every call that touches it.
const notifiedRecently = new Map();
const NOTIFY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const shouldNotify = (key) => {
  const last = notifiedRecently.get(key);
  if (last && Date.now() - last < NOTIFY_COOLDOWN_MS) return false;
  notifiedRecently.set(key, Date.now());
  return true;
};

// Check one assistant's calendar. Returns null when healthy, else a reason.
const checkOne = async ({ userId, subaccountId, assistant }) => {
  // No calendar linked is not reported here. It is often deliberate — plenty of
  // assistants never book — and the dashboard's per-assistant audit already
  // flags it in context. This sweep only reports what is definitely broken, so
  // its notifications stay worth reading.
  if (!assistant.calendar) return null;

  let accessToken;
  try {
    const tkns = await getSubGhlTokens(userId, subaccountId);
    accessToken = tkns?.data?.access_token;
    if (!accessToken) throw new Error("no access token");
  } catch (err) {
    return err.code === "GHL_RECONNECT_REQUIRED"
      ? "the sub-account's GoHighLevel connection has expired"
      : null; // a transient token problem is not worth alarming anyone over
  }

  try {
    await axios.get(
      `https://services.leadconnectorhq.com/calendars/${assistant.calendar}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          Version: "2021-04-15",
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
    );
    return null;
  } catch (err) {
    if (err.response?.status === 404) {
      return "its linked calendar no longer exists in GoHighLevel";
    }
    // Anything else (timeout, 5xx, rate limit) is GoHighLevel having a moment,
    // not a broken configuration. Reporting it would train people to ignore
    // these notifications.
    return null;
  }
};

// Sweep one agency. Exported so it can be run on demand.
const checkAgencyCalendars = async (user) => {
  // p-limit v6 is ESM-only, so it is imported the same way the controllers do.
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(CONCURRENCY);
  const jobs = [];

  for (const sub of user.ghlSubAccountIds || []) {
    for (const assistant of sub.vapiAssistants || []) {
      if (assistant.archived) continue;
      jobs.push(
        limit(async () => {
          const reason = await checkOne({
            userId: user._id,
            subaccountId: sub.accountId,
            assistant,
          });
          return reason
            ? { subaccountId: sub.accountId, assistantId: assistant.assistantId, reason }
            : null;
        }),
      );
    }
  }

  return (await Promise.all(jobs)).filter(Boolean);
};

// Raise a notification about one broken calendar, at most once a day.
const reportCalendarProblem = async ({ userId, subaccountId, assistantId, reason }) => {
  const key = `${userId}:${assistantId}`;
  if (!shouldNotify(key)) return false;

  await createNotification({
    userId,
    type: "calendar_problem",
    title: "Booking calendar needs attention",
    message: `An assistant cannot take bookings — ${reason}. Customers asking for an appointment will not be able to book until this is fixed.`,
    metadata: { subaccountId, assistantId, reason },
  });
  return true;
};

const runSweep = async () => {
  try {
    const users = await userModel
      .find({ "ghlSubAccountIds.0": { $exists: true } })
      .select("ghlSubAccountIds");

    let problems = 0;
    for (const user of users) {
      const found = await checkAgencyCalendars(user);
      for (const p of found) {
        if (await reportCalendarProblem({ userId: user._id, ...p })) problems += 1;
      }
    }
    if (problems) console.log(`📅 calendar sweep: notified about ${problems} problem(s)`);
  } catch (err) {
    console.error("calendar sweep failed:", err.message);
  }
};

// Daily, early morning UTC. Frequent enough to catch a break within a day,
// infrequent enough not to hammer GoHighLevel.
const startCalendarHealthChecks = () => {
  cron.schedule("0 6 * * *", runSweep);
  console.log("📅 Calendar health checks scheduled (daily 06:00 UTC)");
};

module.exports = {
  startCalendarHealthChecks,
  runSweep,
  checkAgencyCalendars,
  reportCalendarProblem,
  checkOne,
};
