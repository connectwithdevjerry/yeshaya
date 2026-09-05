// When an assistant is on duty.
//
// The stakes are asymmetric: wrongly open means an assistant answers at 3am,
// wrongly closed means a real customer is turned away. So the tests lean hard
// on the second — an assistant nobody has scheduled, or whose schedule is
// malformed, must keep answering.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

const W = require("../helpers/workingHours");

// 2026-09-07 is a Monday. Times below are UTC unless a zone is passed.
const at = (iso) => new Date(iso);
const MON_10AM = at("2026-09-07T10:00:00Z");
const MON_3AM  = at("2026-09-07T03:00:00Z");
const SAT_10AM = at("2026-09-12T10:00:00Z");

const weekdays9to5 = {
  enabled: true,
  days: W.defaultWeek(),
};

console.log("\n-- an unscheduled assistant always answers --");
t("no schedule at all", () => assert.strictEqual(W.isWithinWorkingHours(null, "UTC", MON_3AM).open, true));
t("schedule present but switched off", () =>
  assert.strictEqual(
    W.isWithinWorkingHours({ enabled: false, days: W.defaultWeek() }, "UTC", MON_3AM).open,
    true,
  ));
t("enabled but with no days configured", () =>
  assert.strictEqual(W.isWithinWorkingHours({ enabled: true, days: [] }, "UTC", MON_3AM).open, true));
t("enabled is only ever true, never truthy-ish", () =>
  assert.strictEqual(W.isWithinWorkingHours({ enabled: "yes", days: [] }, "UTC", MON_3AM).open, true));

console.log("\n-- a normal working week --");
t("Monday 10am is open", () =>
  assert.strictEqual(W.isWithinWorkingHours(weekdays9to5, "UTC", MON_10AM).open, true));
t("Monday 3am is closed", () =>
  assert.strictEqual(W.isWithinWorkingHours(weekdays9to5, "UTC", MON_3AM).open, false));
t("Saturday is closed", () =>
  assert.strictEqual(W.isWithinWorkingHours(weekdays9to5, "UTC", SAT_10AM).open, false));
t("the closing minute is closed, the opening minute is open", () => {
  const day = [{ day: 1, enabled: true, start: "09:00", end: "17:00" }];
  const s = { enabled: true, days: day };
  assert.strictEqual(W.isWithinWorkingHours(s, "UTC", at("2026-09-07T09:00:00Z")).open, true);
  assert.strictEqual(W.isWithinWorkingHours(s, "UTC", at("2026-09-07T16:59:00Z")).open, true);
  assert.strictEqual(W.isWithinWorkingHours(s, "UTC", at("2026-09-07T17:00:00Z")).open, false);
});

console.log("\n-- the hours are the business's, not the server's --");
t("9am UTC is before a New York office opens", () => {
  // 09:00 UTC is 05:00 in New York.
  const r = W.isWithinWorkingHours(weekdays9to5, "America/New_York", at("2026-09-07T09:00:00Z"));
  assert.strictEqual(r.open, false);
});
t("...and 14:00 UTC is mid-morning there", () =>
  assert.strictEqual(
    W.isWithinWorkingHours(weekdays9to5, "America/New_York", at("2026-09-07T14:00:00Z")).open,
    true,
  ));
t("Sunday 22:00 UTC is Monday 07:00 in Tokyo — still before opening", () =>
  assert.strictEqual(
    W.isWithinWorkingHours(weekdays9to5, "Asia/Tokyo", at("2026-09-06T22:00:00Z")).open,
    false,
  ));
t("the weekday is the business's, not the server's", () => {
  // A Friday evening shift in New York. 2026-09-12T00:30Z is Saturday by the
  // server's clock but Friday 20:30 locally — reading the UTC weekday would
  // find no row for Saturday and turn the caller away mid-shift.
  const fridayEvening = {
    enabled: true,
    days: [{ day: 5, enabled: true, start: "18:00", end: "22:00" }],
  };
  assert.strictEqual(
    W.isWithinWorkingHours(fridayEvening, "America/New_York", at("2026-09-12T00:30:00Z")).open,
    true,
  );
});
t("an unknown zone falls back to UTC rather than throwing", () =>
  assert.strictEqual(W.isWithinWorkingHours(weekdays9to5, "Mars/Olympus", MON_10AM).open, true));

console.log("\n-- a shift that runs past midnight --");
const lateBar = {
  enabled: true,
  days: [
    { day: 5, enabled: true, start: "20:00", end: "02:00" }, // Friday night
  ],
};
t("Friday 21:00 is open", () =>
  assert.strictEqual(W.isWithinWorkingHours(lateBar, "UTC", at("2026-09-11T21:00:00Z")).open, true));
t("Saturday 01:00 is still Friday's shift", () =>
  assert.strictEqual(W.isWithinWorkingHours(lateBar, "UTC", at("2026-09-12T01:00:00Z")).open, true));
t("Saturday 03:00 is after it ends", () =>
  assert.strictEqual(W.isWithinWorkingHours(lateBar, "UTC", at("2026-09-12T03:00:00Z")).open, false));
t("Friday 19:00 is before it starts", () =>
  assert.strictEqual(W.isWithinWorkingHours(lateBar, "UTC", at("2026-09-11T19:00:00Z")).open, false));

console.log("\n-- a malformed row closes that day, never opens it --");
t("unreadable times do not mean open all day", () => {
  const broken = { enabled: true, days: [{ day: 1, enabled: true, start: "nine", end: "five" }] };
  assert.strictEqual(W.isWithinWorkingHours(broken, "UTC", MON_10AM).open, false);
});
t("out-of-range times are refused", () => {
  assert.strictEqual(W.minutesFromTime("25:00"), null);
  assert.strictEqual(W.minutesFromTime("09:75"), null);
  assert.strictEqual(W.minutesFromTime(""), null);
  assert.strictEqual(W.minutesFromTime(null), null);
});
t("times parse in the forms a picker produces", () => {
  assert.strictEqual(W.minutesFromTime("09:00"), 540);
  assert.strictEqual(W.minutesFromTime("9:00"), 540);
  assert.strictEqual(W.minutesFromTime("9"), 540);
  assert.strictEqual(W.minutesFromTime("23:59"), 1439);
  assert.strictEqual(W.minutesFromTime("00:00"), 0);
});

console.log("\n-- what the caller is told --");
t("a closed result carries a message to speak", () => {
  const r = W.isWithinWorkingHours(weekdays9to5, "UTC", MON_3AM);
  assert.strictEqual(r.open, false);
  assert.ok(r.message && r.message.length > 10);
});
t("the agency's own wording is used when they set one", () => {
  const s = { ...weekdays9to5, closedMessage: "We open at nine. Please call back." };
  assert.strictEqual(
    W.isWithinWorkingHours(s, "UTC", MON_3AM).message,
    "We open at nine. Please call back.",
  );
});
t("a blank message falls back rather than saying nothing", () => {
  const s = { ...weekdays9to5, closedMessage: "   " };
  assert.strictEqual(W.isWithinWorkingHours(s, "UTC", MON_3AM).message, W.DEFAULT_CLOSED_MESSAGE);
});
t("the reason names the zone, so a log says which clock was used", () =>
  assert.ok(/America\/New_York/.test(
    W.isWithinWorkingHours(weekdays9to5, "America/New_York", at("2026-09-07T09:00:00Z")).reason,
  )));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
