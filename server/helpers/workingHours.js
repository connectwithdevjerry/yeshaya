// When an assistant is on duty.
//
// An agency can restrict an assistant to particular days and times — so a
// caller at 3am gets a spoken message rather than an assistant answering as if
// the office were open, and so nobody is texted back in the middle of the
// night.
//
// The week is kept as seven independent rows rather than a rule language:
// "Monday 09:00–17:00" is what an agency actually wants to express, and it is
// the same thing they already set on their calendar in GoHighLevel.
const DAYS = [
  { index: 0, key: "sun", label: "Sunday" },
  { index: 1, key: "mon", label: "Monday" },
  { index: 2, key: "tue", label: "Tuesday" },
  { index: 3, key: "wed", label: "Wednesday" },
  { index: 4, key: "thu", label: "Thursday" },
  { index: 5, key: "fri", label: "Friday" },
  { index: 6, key: "sat", label: "Saturday" },
];

const DEFAULT_CLOSED_MESSAGE =
  "Thanks for calling. We're closed at the moment — please try again during our opening hours.";

// "9:00", "09:00", "9" → minutes past midnight. null for anything unreadable,
// so a malformed row can never be read as "open all day".
const minutesFromTime = (value) => {
  const m = String(value ?? "").trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
};

// The day-of-week (0=Sunday) and minutes past midnight, in a given zone.
const localNow = (timeZone, now = new Date()) => {
  const zone = isKnownZone(timeZone) ? timeZone : "UTC";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour12: false,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return {
    dayIndex,
    minutes: (Number(parts.hour) % 24) * 60 + Number(parts.minute),
    zone,
  };
};

const isKnownZone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

// Is this assistant on duty right now?
//
// Returns { open, reason, message }. `open` is true whenever the schedule is
// off or absent, so an assistant nobody has scheduled keeps answering — the
// feature must never silence an assistant by existing.
const isWithinWorkingHours = (schedule, timeZone, now = new Date()) => {
  if (!schedule || schedule.enabled !== true) {
    return { open: true, reason: "no schedule" };
  }

  const rows = Array.isArray(schedule.days) ? schedule.days : [];
  if (!rows.length) return { open: true, reason: "no days configured" };

  const { dayIndex, minutes, zone } = localNow(timeZone, now);
  const closed = {
    open: false,
    reason: `outside working hours (${zone})`,
    message: String(schedule.closedMessage || "").trim() || DEFAULT_CLOSED_MESSAGE,
  };

  const openOn = (index, atMinutes) => {
    const row = rows.find((d) => Number(d.day) === index);
    if (!row || row.enabled === false) return false;
    const start = minutesFromTime(row.start);
    const end = minutesFromTime(row.end);
    if (start === null || end === null) return false;

    // A row that ends before it starts runs past midnight — a bar open
    // 20:00–02:00 is one shift, not a mistake. The part after midnight is
    // matched against the previous day's row, below.
    if (end <= start) return atMinutes >= start;
    return atMinutes >= start && atMinutes < end;
  };

  if (openOn(dayIndex, minutes)) return { open: true, reason: "within hours" };

  // Still inside yesterday's overnight shift?
  const yesterday = (dayIndex + 6) % 7;
  const row = rows.find((d) => Number(d.day) === yesterday);
  if (row && row.enabled !== false) {
    const start = minutesFromTime(row.start);
    const end = minutesFromTime(row.end);
    if (start !== null && end !== null && end <= start && minutes < end) {
      return { open: true, reason: "within overnight hours" };
    }
  }

  return closed;
};

// A week with nothing set — weekdays 09:00–17:00, weekend off. Only used to
// seed the UI when an agency first opens the panel; an assistant with no
// schedule stored is always on duty.
const defaultWeek = () =>
  DAYS.map(({ index }) => ({
    day: index,
    enabled: index >= 1 && index <= 5,
    start: "09:00",
    end: "17:00",
  }));

module.exports = {
  DAYS,
  DEFAULT_CLOSED_MESSAGE,
  minutesFromTime,
  isWithinWorkingHours,
  defaultWeek,
};
