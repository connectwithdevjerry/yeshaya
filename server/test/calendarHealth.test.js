// Booking-calendar health checks.
//
// The point of this sweep is that its notifications stay worth reading, so what
// it does NOT report matters as much as what it does.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

// Stub axios and the GHL token helper before the module loads.
const AXIOS = require.resolve("axios");
let getHandler = async () => ({ data: {} });
require.cache[AXIOS] = {
  id: AXIOS, filename: AXIOS, loaded: true,
  exports: { get: (...a) => getHandler(...a) },
};
const HELPERS = require.resolve("../helperFunctions");
let tokenHandler = async () => ({ data: { access_token: "tok" } });
require.cache[HELPERS] = {
  id: HELPERS, filename: HELPERS, loaded: true,
  exports: { getSubGhlTokens: (...a) => tokenHandler(...a) },
};

const health = require("../helpers/calendarHealth");
const args = { userId: "u1", subaccountId: "loc1" };

(async () => {
  console.log("\n-- what counts as broken --");
  getHandler = async () => ({ data: { id: "cal1" } });
  t("a reachable calendar is healthy", async () => {});
  assert.strictEqual(await health.checkOne({ ...args, assistant: { calendar: "cal1" } }), null);
  t("healthy returns null", () => assert.ok(true));

  getHandler = async () => { throw Object.assign(new Error("nf"), { response: { status: 404 } }); };
  const gone = await health.checkOne({ ...args, assistant: { calendar: "cal1" } });
  t("a calendar deleted in GHL is reported", () =>
    assert.match(gone, /no longer exists in GoHighLevel/));

  tokenHandler = async () => { throw Object.assign(new Error("x"), { code: "GHL_RECONNECT_REQUIRED" }); };
  const expired = await health.checkOne({ ...args, assistant: { calendar: "cal1" } });
  t("an expired GHL connection is reported", () =>
    assert.match(expired, /connection has expired/));
  tokenHandler = async () => ({ data: { access_token: "tok" } });

  console.log("\n-- what is deliberately NOT reported --");
  const none = await health.checkOne({ ...args, assistant: { calendar: "" } });
  t("no calendar linked is not a sweep problem (often deliberate)", () =>
    assert.strictEqual(none, null));

  getHandler = async () => { throw Object.assign(new Error("boom"), { response: { status: 500 } }); };
  t("a GHL 5xx is not reported — that is their outage, not a broken setup", async () => {});
  assert.strictEqual(await health.checkOne({ ...args, assistant: { calendar: "cal1" } }), null);
  t("5xx returns null", () => assert.ok(true));

  getHandler = async () => { throw Object.assign(new Error("timeout"), { code: "ECONNABORTED" }); };
  t("a timeout is not reported", async () => {});
  assert.strictEqual(await health.checkOne({ ...args, assistant: { calendar: "cal1" } }), null);
  t("timeout returns null", () => assert.ok(true));

  console.log("\n-- sweeping an agency --");
  getHandler = async (url) =>
    url.includes("good") ? { data: {} } : Promise.reject(Object.assign(new Error("nf"), { response: { status: 404 } }));
  const found = await health.checkAgencyCalendars({
    _id: "u1",
    ghlSubAccountIds: [{
      accountId: "loc1",
      vapiAssistants: [
        { assistantId: "a_ok",   calendar: "good1" },
        { assistantId: "a_bad",  calendar: "gone1" },
        { assistantId: "a_none", calendar: "" },
        { assistantId: "a_arch", calendar: "gone2", archived: true },
      ],
    }],
  });
  t("only the genuinely broken assistant is reported", () => {
    assert.strictEqual(found.length, 1);
    assert.strictEqual(found[0].assistantId, "a_bad");
  });
  t("archived assistants are skipped", () =>
    assert.ok(!found.some((f) => f.assistantId === "a_arch")));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
