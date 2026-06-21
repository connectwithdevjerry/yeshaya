const axios = require("axios");
const userModel = require("../model/user.model");
const appointmentModel = require("../model/appointment.model");
const emailHelper = require("../resendObject");
const sendUserEmail = require("../helpers/sendUserEmail");
const { createNotification } = require("./notification.controller");
const { fmtWhen, confirmationEmail } = require("../helpers/appointmentEmails");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Extract a human-readable message from a GHL/axios error
const ghlErr = (e) => {
  const d = e.response?.data;
  const m = d?.message || d?.error || d?.msg;
  if (Array.isArray(m)) return m.join(", ");
  return m || e.message;
};

// getSubGhlTokens lives in assistant.controller — re-require lazily to avoid cycles
const getTokens = async (userId, accountId) => {
  const { getSubGhlTokensExport } = require("./assistant.controller");
  return getSubGhlTokensExport(userId, accountId);
};

const GHL = "https://services.leadconnectorhq.com";
const RANGE_BACK = 60 * 24 * 60 * 60 * 1000;   // 60 days back
const RANGE_FWD  = 120 * 24 * 60 * 60 * 1000;  // 120 days forward

// ─── Pull GHL events for the sub-account's calendars → upsert into store ──────
const syncGhlAppointments = async (user, subaccountId, accessToken) => {
  const sub = user.ghlSubAccountIds.find((s) => s.accountId === subaccountId);
  if (!sub) return { calendarNames: {} };

  // Distinct calendar IDs across this sub-account's assistants
  const calendarIds = [
    ...new Set((sub.vapiAssistants || []).map((a) => a.calendar).filter(Boolean)),
  ];

  // Calendar id → name (for the per-calendar breakdown)
  const calendarNames = {};
  try {
    const calRes = await axios.get(`${GHL}/calendars/`, {
      params: { locationId: subaccountId },
      headers: { Authorization: `Bearer ${accessToken}`, Version: "2021-04-15", Accept: "application/json" },
    });
    (calRes.data?.calendars || []).forEach((c) => { calendarNames[c.id] = c.name; });
  } catch (_) {}

  const now = Date.now();
  for (const calendarId of calendarIds) {
    try {
      const res = await axios.get(`${GHL}/calendars/events`, {
        params: { locationId: subaccountId, calendarId, startTime: now - RANGE_BACK, endTime: now + RANGE_FWD },
        headers: { Authorization: `Bearer ${accessToken}`, Version: "2021-07-28" },
      });
      const events = res.data?.events || res.data || [];
      for (const ev of events) {
        if (!ev?.id || !ev?.startTime) continue;
        const cancelled = (ev.appointmentStatus || "").toLowerCase() === "cancelled";
        await appointmentModel.updateOne(
          { ghlEventId: ev.id },
          {
            $set: {
              userId: user._id,
              subaccountId,
              calendarId,
              ghlEventId: ev.id,
              ghlContactId: ev.contactId || "",
              customerName: ev.title || "",
              startTime: new Date(ev.startTime),
              title: ev.title || "",
              status: cancelled ? "cancelled" : "booked",
            },
          },
          { upsert: true },
        );
      }
    } catch (e) {
      console.error(`⚠️ sync calendar ${calendarId} failed:`, e.response?.data?.message || e.message);
    }
  }

  return { calendarNames };
};

// ─── Compute metrics from the store ───────────────────────────────────────────
const computeMetrics = (appts, calendarNames) => {
  const now = Date.now();
  const weekEnd  = now + 7 * 24 * 60 * 60 * 1000;
  const monthEnd = now + 30 * 24 * 60 * 60 * 1000;

  const booked = appts.filter((a) => a.status === "booked");
  const upcoming = booked.filter((a) => new Date(a.startTime).getTime() > now);

  const byCalendar = {};
  booked.forEach((a) => {
    const key = calendarNames[a.calendarId] || a.calendarId || "Unknown";
    byCalendar[key] = (byCalendar[key] || 0) + 1;
  });

  // bookings created per day over last 14 days (by createdAt)
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const count = appts.filter((a) => new Date(a.createdAt).toISOString().slice(0, 10) === key).length;
    days.push({ date: key, count });
  }

  return {
    total: booked.length,
    upcoming: upcoming.length,
    thisWeek: upcoming.filter((a) => new Date(a.startTime).getTime() <= weekEnd).length,
    thisMonth: upcoming.filter((a) => new Date(a.startTime).getTime() <= monthEnd).length,
    cancelled: appts.filter((a) => a.status === "cancelled").length,
    byCalendar: Object.entries(byCalendar).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    trend: days,
  };
};

// ─── GET /appointments?subaccountId= → sync + return list + metrics ────────────
const getAppointments = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId } = req.query;
    if (!subaccountId) return res.status(400).json({ status: false, message: "subaccountId is required" });

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    // Try to sync from GHL (best-effort; reconnect-aware)
    let calendarNames = {};
    try {
      const tkns = await getTokens(userId, subaccountId);
      const result = await syncGhlAppointments(user, subaccountId, tkns.data.access_token);
      calendarNames = result.calendarNames;
    } catch (err) {
      if (err.code === "GHL_RECONNECT_REQUIRED") {
        // Still return stored appointments; flag reconnect
        const stored = await appointmentModel.find({ userId, subaccountId }).sort({ startTime: 1 }).lean();
        return res.status(200).json({
          status: true,
          reconnectRequired: true,
          appointments: stored,
          metrics: computeMetrics(stored, {}),
        });
      }
      console.error("⚠️ appointment sync skipped:", err.message);
    }

    const appts = await appointmentModel.find({ userId, subaccountId }).sort({ startTime: 1 }).lean();
    const metrics = computeMetrics(appts, calendarNames);

    return res.status(200).json({ status: true, appointments: appts, metrics });
  } catch (err) {
    console.error("❌ getAppointments error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Free slots for a calendar on a given date ────────────────────────────────
const getCalendarSlots = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, calendarId, date } = req.query;
    if (!subaccountId || !calendarId || !date) {
      return res.status(400).json({ status: false, message: "subaccountId, calendarId and date are required" });
    }

    let tkns;
    try {
      tkns = await getTokens(userId, subaccountId);
    } catch (err) {
      if (err.code === "GHL_RECONNECT_REQUIRED") {
        return res.status(200).json({ status: false, reconnectRequired: true, message: "Reconnect GoHighLevel to load availability." });
      }
      throw err;
    }

    const startMs = new Date(`${date}T00:00:00Z`).getTime();
    const endMs   = new Date(`${date}T23:59:59Z`).getTime();

    let response;
    try {
      response = await axios.get(`${GHL}/calendars/${calendarId}/free-slots`, {
        params: { startDate: startMs, endDate: endMs },
        headers: { Authorization: `Bearer ${tkns.data.access_token}`, Version: "2021-07-28" },
      });
    } catch (apiErr) {
      // GHL rejects free-slots for non-bookable calendar types (collection/service,
      // no availability hours, etc). Don't 500 — return an empty set with the reason.
      const ghlMsg = apiErr.response?.data?.message
        || (Array.isArray(apiErr.response?.data?.message) ? apiErr.response.data.message.join(", ") : null)
        || apiErr.response?.data?.msg
        || "This calendar has no bookable availability.";
      console.warn(`⚠️ free-slots unavailable for calendar ${calendarId}:`, apiErr.response?.status, apiErr.response?.data || apiErr.message);
      return res.status(200).json({ status: true, slots: [], unavailable: true, message: ghlMsg });
    }

    // GHL returns either { slots: [...] } or { "YYYY-MM-DD": { slots: [...] } }
    const data = response.data || {};
    let slots = [];
    if (Array.isArray(data.slots)) {
      slots = data.slots;
    } else {
      Object.values(data).forEach((v) => {
        if (v && Array.isArray(v.slots)) slots = slots.concat(v.slots);
      });
    }

    return res.status(200).json({ status: true, slots });
  } catch (err) {
    console.error("❌ getCalendarSlots error:", err.response?.data || err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Manually book an appointment ─────────────────────────────────────────────
const bookAppointmentManual = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, calendarId, customerName, customerEmail, startTime } = req.body;

    if (!subaccountId || !calendarId || !startTime) {
      return res.status(400).json({ status: false, message: "subaccountId, calendarId and startTime are required" });
    }
    if (!customerEmail || !EMAIL_RE.test(customerEmail.trim())) {
      return res.status(400).json({ status: false, message: "A valid customer email is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    let tkns;
    try {
      tkns = await getTokens(userId, subaccountId);
    } catch (err) {
      if (err.code === "GHL_RECONNECT_REQUIRED") {
        return res.status(200).json({ status: false, reconnectRequired: true, message: "Reconnect GoHighLevel to book." });
      }
      throw err;
    }
    const accessToken = tkns.data.access_token;
    const email = customerEmail.trim().toLowerCase();
    const name = (customerName || "").trim() || email;

    // Upsert contact
    let contactId;
    try {
      const contactRes = await axios.post(
        `${GHL}/contacts/upsert`,
        { email, firstName: name, locationId: subaccountId },
        { headers: { Authorization: `Bearer ${accessToken}`, Version: "2021-07-28" } },
      );
      contactId = contactRes.data?.contact?.id;
    } catch (e) {
      throw new Error(`Contact step failed: ${ghlErr(e)}`);
    }

    // Create appointment (v2 endpoint is /calendars/events/appointments)
    const title = `Booking: ${name}`;
    let ghlEventId = "";
    try {
      const eventRes = await axios.post(
        `${GHL}/calendars/events/appointments`,
        { calendarId, locationId: subaccountId, contactId, startTime, title },
        { headers: { Authorization: `Bearer ${accessToken}`, Version: "2021-07-28" } },
      );
      ghlEventId = eventRes.data?.id || eventRes.data?.event?.id || eventRes.data?.appointment?.id || "";
    } catch (e) {
      throw new Error(`Appointment step failed: ${ghlErr(e)}`);
    }

    // Store
    await appointmentModel.create({
      userId, subaccountId, calendarId, ghlEventId, ghlContactId: contactId,
      customerName: name, customerEmail: email, startTime: new Date(startTime), title,
    });

    // Confirm + notify (reminders handled by the cron)
    const businessName = user.company?.name || "us";
    const when = fmtWhen(startTime);
    try {
      await sendUserEmail(userId, email, `Appointment Confirmed — ${businessName}`,
        confirmationEmail({ customerName: name, when, businessName, title: "" }));
    } catch (e) { console.error("⚠️ manual confirmation email failed:", e.message); }

    await createNotification({
      userId, type: "general", title: "Appointment Booked",
      message: `${name} was booked for ${when} (manual).`,
      metadata: { subaccountId, startTime, customerEmail: email },
    });

    console.log(`✅ bookAppointmentManual → ${email} @ ${startTime}`);
    return res.status(200).json({ status: true, message: "Appointment booked" });
  } catch (err) {
    console.error("❌ bookAppointmentManual error:", err.response?.data || err.message);
    return res.status(500).json({ status: false, message: err.response?.data?.message || err.message });
  }
};

module.exports = { getAppointments, getCalendarSlots, bookAppointmentManual };
