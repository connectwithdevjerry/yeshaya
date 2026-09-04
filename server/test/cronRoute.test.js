// The scheduled sweeps are reached over HTTP because node-cron does not fire on
// a serverless runtime. This is the auth boundary in front of them: the sweeps
// send mail to real customers, so an unprotected route is not an option.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

// Stub the sweeps so nothing reaches a database or a mail provider.
const REMIND = require.resolve("../helpers/appointmentReminders");
const CAL = require.resolve("../helpers/calendarHealth");
const ran = [];
require.cache[REMIND] = {
  id: REMIND, filename: REMIND, loaded: true,
  exports: { runSweep: async () => { ran.push("reminders"); }, startAppointmentReminders: () => {} },
};
require.cache[CAL] = {
  id: CAL, filename: CAL, loaded: true,
  exports: { runSweep: async () => { ran.push("calendars"); }, startCalendarHealthChecks: () => {} },
};

const router = require("../route/cron.route");

// Drive the router directly rather than standing up a server.
const call = (path, { auth, key } = {}) =>
  new Promise((resolve) => {
    const req = {
      method: "POST",
      url: path,
      params: { sweep: path.replace(/^\//, "").split("?")[0] },
      query: key ? { key } : {},
      headers: auth ? { authorization: `Bearer ${auth}` } : {},
    };
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(body) { resolve({ status: this.statusCode, body }); return this; },
    };
    // The router registers one handler at "/:sweep".
    const layer = router.stack[0];
    layer.handle(req, res, () => resolve({ status: 404, body: {} }));
  });

(async () => {
  console.log("\n-- the cron endpoint refuses anything unauthenticated --");
  delete process.env.CRON_SECRET;
  ran.length = 0;
  let r = await call("/reminders");
  t("with no CRON_SECRET set, everything is refused", () => {
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(ran, []);
  });

  process.env.CRON_SECRET = "s3cret";
  ran.length = 0;
  r = await call("/reminders");
  t("no credential is refused", () => {
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(ran, []);
  });

  ran.length = 0;
  r = await call("/reminders", { auth: "wrong" });
  t("the wrong bearer token is refused", () => {
    assert.strictEqual(r.status, 401);
    assert.deepStrictEqual(ran, []);
  });

  console.log("\n-- and runs the sweep for a caller that is authorised --");
  ran.length = 0;
  r = await call("/reminders", { auth: "s3cret" });
  t("Vercel Cron's bearer token runs the reminder sweep", () => {
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(ran, ["reminders"]);
  });

  ran.length = 0;
  r = await call("/calendars", { key: "s3cret" });
  t("a query key works for schedulers that cannot set headers", () => {
    assert.strictEqual(r.status, 200);
    assert.deepStrictEqual(ran, ["calendars"]);
  });

  ran.length = 0;
  r = await call("/nonsense", { auth: "s3cret" });
  t("an unknown sweep is a 404, not a silent success", () => {
    assert.strictEqual(r.status, 404);
    assert.deepStrictEqual(ran, []);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
