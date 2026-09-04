// The Vapi tool-call payload adapters.
//
// Every one of these was an unchecked assumption in the webhook, and each
// failed silently: a tool that cannot read its arguments returns nothing
// useful, and the caller hears the assistant stall or improvise.
const assert = require("assert");

// The controller constructs Resend and Stripe clients at require time, and both
// throw without a key. Nothing under test talks to either, so stub the keys
// rather than leave the whole file un-runnable (which is what npm test hit).
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "re_test";
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_stub";

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

const { parseToolArgs, resolveAssistantId, toolCallsFrom, toEpochMs, dayWindowAround, isValidTimeZone, slotsFromFreeSlots, toGhlAppointmentTime, matchSlot } = require("../controller/assistant.controller");

console.log("\n-- tool arguments --");
t("JSON string is parsed (the OpenAI convention Vapi follows)", () =>
  assert.deepStrictEqual(
    parseToolArgs('{"startTime":"2026-09-10","customerEmail":"a@b.com"}'),
    { startTime: "2026-09-10", customerEmail: "a@b.com" },
  ));
t("an object passes through unchanged", () =>
  assert.deepStrictEqual(parseToolArgs({ startTime: "2026-09-10" }), { startTime: "2026-09-10" }));
t("the date actually survives — this is what booking needs", () =>
  assert.strictEqual(parseToolArgs('{"startTime":"2026-09-10"}').startTime, "2026-09-10"));
t("malformed JSON degrades to empty, never throws mid-call", () =>
  assert.deepStrictEqual(parseToolArgs("{not json"), {}));
t("missing arguments degrade to empty", () => {
  assert.deepStrictEqual(parseToolArgs(undefined), {});
  assert.deepStrictEqual(parseToolArgs(null), {});
  assert.deepStrictEqual(parseToolArgs(""), {});
});
t("nested values survive the parse", () =>
  assert.deepStrictEqual(
    parseToolArgs('{"customFields":{"vehicle":"Civic"}}').customFields,
    { vehicle: "Civic" },
  ));

console.log("\n-- assistant id --");
t("top-level assistantId", () =>
  assert.strictEqual(resolveAssistantId({ assistantId: "a1" }), "a1"));
t("nested under assistant", () =>
  assert.strictEqual(resolveAssistantId({ assistant: { id: "a2" } }), "a2"));
t("nested under call", () =>
  assert.strictEqual(resolveAssistantId({ call: { assistantId: "a3" } }), "a3"));
t("nested under call.assistant", () =>
  assert.strictEqual(resolveAssistantId({ call: { assistant: { id: "a4" } } }), "a4"));
t("absent yields empty, so the caller can answer instead of throwing", () =>
  assert.strictEqual(resolveAssistantId({}), ""));

console.log("\n-- tool call list --");
t("toolCalls", () => assert.strictEqual(toolCallsFrom({ toolCalls: [{ id: "1" }] }).length, 1));
t("toolCallList (older payloads)", () =>
  assert.strictEqual(toolCallsFrom({ toolCallList: [{ id: "1" }, { id: "2" }] }).length, 2));
t("neither present yields an empty list", () => assert.deepStrictEqual(toolCallsFrom({}), []));
t("a non-array is not trusted", () => assert.deepStrictEqual(toolCallsFrom({ toolCalls: "x" }), []));

console.log("\n-- date arguments --");
// The live failure: the schema asks for an ISO timestamp, the handler built
// `${startTime}T00:00:00Z` from it, and GoHighLevel answered every availability
// check with "startDate must be a number conforming to the specified
// constraints" because NaN reached it as the string "NaN".
t("a full ISO timestamp is read, not mangled", () =>
  assert.strictEqual(toEpochMs("2026-09-10T09:00:00Z"), Date.parse("2026-09-10T09:00:00Z")));
t("the old interpolation is what broke — confirm it produced NaN", () =>
  assert.ok(Number.isNaN(new Date("2026-09-10T09:00:00Z" + "T00:00:00Z").getTime())));
t("a bare date anchors to the start of that UTC day", () =>
  assert.strictEqual(toEpochMs("2026-09-10"), Date.parse("2026-09-10T00:00:00.000Z")));
t("a bare date can anchor to the end of the day for a range", () =>
  assert.strictEqual(toEpochMs("2026-09-10", { endOfDay: true }), Date.parse("2026-09-10T23:59:59.999Z")));
t("epoch milliseconds pass through", () =>
  assert.strictEqual(toEpochMs(1789041600000), 1789041600000));
t("epoch seconds are scaled up", () =>
  assert.strictEqual(toEpochMs(1789041600), 1789041600000));
t("numeric strings are accepted in both scales", () => {
  assert.strictEqual(toEpochMs("1789041600000"), 1789041600000);
  assert.strictEqual(toEpochMs("1789041600"), 1789041600000);
});
t("a space instead of T still parses", () =>
  assert.strictEqual(toEpochMs("2026-09-10 14:30:00Z"), Date.parse("2026-09-10T14:30:00Z")));
t("unreadable input is null, never NaN — NaN is what reached GHL", () => {
  for (const bad of ["next tuesday", "", "   ", null, undefined, "not a date", {}]) {
    const got = toEpochMs(bad);
    assert.strictEqual(got, null, `expected null for ${JSON.stringify(bad)}, got ${got}`);
  }
});
t("NaN itself is rejected", () => assert.strictEqual(toEpochMs(NaN), null));

t("a day window spans one whole UTC day", () => {
  const [start, end] = dayWindowAround(Date.parse("2026-09-10T09:00:00Z"));
  assert.strictEqual(start, Date.parse("2026-09-10T00:00:00.000Z"));
  assert.strictEqual(end, Date.parse("2026-09-10T23:59:59.999Z"));
});
t("asking about a time of day still searches the whole day", () => {
  const [start, end] = dayWindowAround(toEpochMs("2026-09-10T23:30:00Z"));
  assert.strictEqual(start, Date.parse("2026-09-10T00:00:00.000Z"));
  assert.ok(end > start);
});

console.log("\n-- day windows honour the caller's timezone --");
// A UTC window ends at 23:59Z, which is 19:59 in New York — so an assistant
// asked "anything Friday?" never saw Friday evening.
const nyLabel = (ms) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(ms));

t("a New York day starts at local midnight", () => {
  const [start] = dayWindowAround(Date.parse("2026-09-11T15:00:00Z"), "America/New_York");
  assert.strictEqual(nyLabel(start), "2026-09-11, 00:00");
});
t("...and ends just before the next local midnight", () => {
  const [, end] = dayWindowAround(Date.parse("2026-09-11T15:00:00Z"), "America/New_York");
  assert.strictEqual(nyLabel(end), "2026-09-11, 23:59");
});
t("the window is one day long", () => {
  const [start, end] = dayWindowAround(Date.parse("2026-09-11T15:00:00Z"), "America/New_York");
  assert.strictEqual(end - start, 24 * 60 * 60 * 1000 - 1);
});
t("a half-hour zone lands on local midnight too", () => {
  const [start] = dayWindowAround(Date.parse("2026-09-11T15:00:00Z"), "Asia/Kolkata");
  const label = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(new Date(start));
  assert.strictEqual(label, "2026-09-11, 00:00");
});
t("a day that ends a DST change still starts at local midnight", () => {
  // US clocks go back on 2026-11-01; that local day is 25 hours long.
  const [start] = dayWindowAround(Date.parse("2026-11-01T18:00:00Z"), "America/New_York");
  assert.strictEqual(nyLabel(start), "2026-11-01, 00:00");
});
t("a day that starts one does too", () => {
  // US clocks go forward on 2026-03-08.
  const [start] = dayWindowAround(Date.parse("2026-03-08T18:00:00Z"), "America/New_York");
  assert.strictEqual(nyLabel(start), "2026-03-08, 00:00");
});
t("no zone keeps the old UTC behaviour", () => {
  const [start, end] = dayWindowAround(Date.parse("2026-09-11T15:00:00Z"));
  assert.strictEqual(start, Date.parse("2026-09-11T00:00:00.000Z"));
  assert.strictEqual(end, Date.parse("2026-09-11T23:59:59.999Z"));
});
t("a zone the model invented is refused, not forwarded to GHL", () => {
  for (const bad of ["GMT+1", "Mars/Olympus", "pacific standard time", "", null, undefined, 5]) {
    assert.strictEqual(isValidTimeZone(bad), false, `expected ${JSON.stringify(bad)} to be invalid`);
  }
});
t("real zones pass, including the legacy aliases a model reaches for", () => {
  // "EST" and "EST5EDT" are genuine tz database entries, so they are forwarded
  // rather than dropped — only strings no tz database knows are refused.
  for (const good of ["America/New_York", "UTC", "Europe/London", "EST", "EST5EDT", "GMT"]) {
    assert.ok(isValidTimeZone(good), `expected ${good} to be valid`);
  }
});
t("an invalid zone falls back to the UTC window rather than throwing", () => {
  const [start, end] = dayWindowAround(Date.parse("2026-09-11T15:00:00Z"), "Mars/Olympus");
  assert.strictEqual(start, Date.parse("2026-09-11T00:00:00.000Z"));
  assert.strictEqual(end, Date.parse("2026-09-11T23:59:59.999Z"));
});

console.log("\n-- free-slot shapes --");
t("a top-level slots array is used as-is", () =>
  assert.deepStrictEqual(
    slotsFromFreeSlots({ slots: ["2026-09-10T09:00:00-04:00"] }),
    ["2026-09-10T09:00:00-04:00"]));
t("a date-keyed response is flattened, not read as empty", () =>
  assert.deepStrictEqual(
    slotsFromFreeSlots({
      "2026-09-10": { slots: ["2026-09-10T09:00:00-04:00", "2026-09-10T10:00:00-04:00"] },
      traceId: "abc",
    }),
    ["2026-09-10T09:00:00-04:00", "2026-09-10T10:00:00-04:00"]));
t("several days are combined", () =>
  assert.strictEqual(
    slotsFromFreeSlots({
      "2026-09-10": { slots: ["a", "b"] },
      "2026-09-11": { slots: ["c"] },
      traceId: "x",
    }).length, 3));
t("traceId is never mistaken for a day", () =>
  assert.ok(!slotsFromFreeSlots({ traceId: "abc" }).includes("abc")));
t("a genuinely empty diary is still empty", () => {
  assert.deepStrictEqual(slotsFromFreeSlots({ slots: [] }), []);
  assert.deepStrictEqual(slotsFromFreeSlots({ traceId: "x" }), []);
  assert.deepStrictEqual(slotsFromFreeSlots(null), []);
  assert.deepStrictEqual(slotsFromFreeSlots("nope"), []);
});

console.log("\n-- appointment times --");
// GoHighLevel hands the assistant slots carrying the calendar's own offset.
// Echoing one back should reach the booking endpoint exactly as it came.
t("a slot string from free-slots goes through untouched", () =>
  assert.strictEqual(
    toGhlAppointmentTime("2026-09-10T09:00:00-04:00").time,
    "2026-09-10T09:00:00-04:00"));
t("a Z time is kept as-is too", () =>
  assert.strictEqual(
    toGhlAppointmentTime("2026-09-10T13:00:00Z").time,
    "2026-09-10T13:00:00Z"));
t("milliseconds are never emitted — GHL's format has none", () => {
  const { time } = toGhlAppointmentTime(Date.parse("2026-09-10T13:00:00Z"));
  assert.strictEqual(time, "2026-09-10T13:00:00Z");
  assert.ok(!/\.\d{3}/.test(time));
});
t("an epoch becomes a clean ISO string", () =>
  assert.strictEqual(
    toGhlAppointmentTime(Date.parse("2026-09-10T13:00:00Z")).time,
    "2026-09-10T13:00:00Z"));
t("a time with no zone is flagged, not silently booked", () => {
  const got = toGhlAppointmentTime("2026-09-10T09:00:00");
  assert.strictEqual(got.zoneless, true);
  assert.strictEqual(got.time, "2026-09-10T09:00:00Z");
});
t("a time that carries a zone is not flagged", () => {
  assert.strictEqual(toGhlAppointmentTime("2026-09-10T09:00:00-04:00").zoneless, false);
  assert.strictEqual(toGhlAppointmentTime("2026-09-10T13:00:00Z").zoneless, false);
});
t("an unreadable time is null, so booking asks again", () =>
  assert.strictEqual(toGhlAppointmentTime("some time next week").time, null));

console.log("\n-- booking against the slots GHL published --");
// GHL answers a booking whose startTime does not line up with a published slot
// with "The slot you have selected is no longer available", on a free calendar.
const DAY = [
  "2026-09-10T09:00:00-04:00",
  "2026-09-10T09:30:00-04:00",
  "2026-09-10T14:00:00-04:00",
];
t("the slot the assistant echoed back is returned verbatim", () =>
  assert.strictEqual(matchSlot(DAY, "2026-09-10T09:30:00-04:00"), "2026-09-10T09:30:00-04:00"));
t("the same instant written as UTC still finds its slot", () =>
  // 09:00-04:00 is 13:00Z — the booking that was being rejected.
  assert.strictEqual(matchSlot(DAY, "2026-09-10T13:00:00.000Z"), "2026-09-10T09:00:00-04:00"));
t("a wall-clock time with no zone matches the local slot, not UTC", () =>
  assert.strictEqual(matchSlot(DAY, "2026-09-10T14:00:00"), "2026-09-10T14:00:00-04:00"));
t("a few seconds of rounding is the same appointment", () =>
  assert.strictEqual(matchSlot(DAY, "2026-09-10T09:00:30-04:00"), "2026-09-10T09:00:00-04:00"));
t("a time nowhere near a slot matches nothing, so alternatives are offered", () => {
  assert.strictEqual(matchSlot(DAY, "2026-09-10T11:15:00-04:00"), null);
  assert.strictEqual(matchSlot(DAY, "2026-09-10T20:00:00-04:00"), null);
});
t("an empty or unusable slot list matches nothing", () => {
  assert.strictEqual(matchSlot([], "2026-09-10T09:00:00-04:00"), null);
  assert.strictEqual(matchSlot(null, "2026-09-10T09:00:00-04:00"), null);
  assert.strictEqual(matchSlot([1, 2, null], "2026-09-10T09:00:00-04:00"), null);
});
t("an unreadable request matches nothing rather than the first slot", () =>
  assert.strictEqual(matchSlot(DAY, "sometime tomorrow"), null));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
