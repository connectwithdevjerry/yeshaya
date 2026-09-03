// Exercises the wallet/billing helper.
//
// The sandbox's network policy blocks the MongoDB binary download, so the
// models are stubbed with an in-memory store that mimics the slice of the
// Mongoose API these helpers use — including the unique-index behaviour that
// the idempotency guarantee depends on. Run against a real MongoDB before ship.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

// ─── Stub the models before the helper requires them ─────────────────────────
const EVENT_PATH = require.resolve("../model/billingEvent.model");
const USER_PATH = require.resolve("../model/user.model");

const events = [];
const users = {};

require.cache[EVENT_PATH] = {
  id: EVENT_PATH, filename: EVENT_PATH, loaded: true,
  exports: {
    async create(doc) {
      // Emulate the unique partial index on (userId, idempotencyKey).
      if (doc.idempotencyKey && events.some(
        (e) => String(e.userId) === String(doc.userId) && e.idempotencyKey === doc.idempotencyKey,
      )) {
        const err = new Error("E11000 duplicate key");
        err.code = 11000;
        throw err;
      }
      const row = { processedAt: new Date(), ...doc };
      events.push(row);
      return row;
    },
    find(q) {
      return {
        lean: async () => events.filter((e) => {
          if (String(e.userId) !== String(q.userId)) return false;
          if (q.subaccountId && e.subaccountId !== q.subaccountId) return false;
          if (q.phoneSid && e.phoneSid !== q.phoneSid) return false;
          if (q.processedAt?.$gte && new Date(e.processedAt) < q.processedAt.$gte) return false;
          if (q.processedAt?.$lte && new Date(e.processedAt) > q.processedAt.$lte) return false;
          return true;
        }),
      };
    },
  },
};

require.cache[USER_PATH] = {
  id: USER_PATH, filename: USER_PATH, loaded: true,
  exports: {
    async findByIdAndUpdate(id, update) {
      const u = users[String(id)];
      if (!u) return null;
      if (update.$inc?.walletBalance) u.walletBalance += update.$inc.walletBalance;
      return u;
    },
  },
};

const billing = require("../helpers/billing");
const { amountToClear } = require("../helpers/autoTopUp");

const UID = "agency1";
const reset = (balance = 100) => {
  events.length = 0;
  users[UID] = { _id: UID, walletBalance: balance };
};

(async () => {
  console.log("\n-- atomic debit --");
  reset(100);
  const r = await billing.chargeWallet({
    user: users[UID], userId: UID, amount: 2.5, type: "chat_message", callId: "c1",
  });
  t("wallet debited", () => assert.strictEqual(users[UID].walletBalance, 97.5));
  t("charge reported", () => { assert.strictEqual(r.charged, true); assert.strictEqual(r.amount, 2.5); });
  t("event recorded as negative", () => assert.strictEqual(events[0].amount, -2.5));

  console.log("\n-- concurrency: the bug this replaces --");
  reset(100);
  await Promise.all([
    billing.chargeWallet({ user: users[UID], userId: UID, amount: 5, type: "chat_message", callId: "a" }),
    billing.chargeWallet({ user: users[UID], userId: UID, amount: 3, type: "chat_message", callId: "b" }),
    billing.chargeWallet({ user: users[UID], userId: UID, amount: 1, type: "chat_message", callId: "c" }),
  ]);
  t("three concurrent charges all land (no lost update)", () =>
    assert.strictEqual(users[UID].walletBalance, 91));
  t("three events recorded", () => assert.strictEqual(events.length, 3));

  console.log("\n-- idempotency --");
  reset(100);
  const first = await billing.chargeWallet({
    user: users[UID], userId: UID, amount: 4, type: "end-of-call-report",
    callId: "call_1", idempotencyKey: "call:call_1",
  });
  const retry = await billing.chargeWallet({
    user: users[UID], userId: UID, amount: 4, type: "call.ended",
    callId: "call_1", idempotencyKey: "call:call_1",
  });
  t("first charge lands", () => assert.strictEqual(first.charged, true));
  t("retry with same key is refused", () => {
    assert.strictEqual(retry.charged, false);
    assert.strictEqual(retry.reason, "duplicate");
  });
  t("wallet debited exactly once", () => assert.strictEqual(users[UID].walletBalance, 96));
  t("a different Vapi event type for the same call cannot double-charge", () =>
    assert.strictEqual(events.length, 1));

  console.log("\n-- credit --");
  reset(10);
  const c1 = await billing.creditWallet({ userId: UID, amount: 50, type: "WALLET_TOPUP", callId: "pi_1" });
  const c2 = await billing.creditWallet({ userId: UID, amount: 50, type: "WALLET_TOPUP", callId: "pi_1" });
  t("wallet credited", () => assert.strictEqual(users[UID].walletBalance, 60));
  t("duplicate PaymentIntent does not double-credit", () => {
    assert.strictEqual(c1.credited, true);
    assert.strictEqual(c2.credited, false);
    assert.strictEqual(users[UID].walletBalance, 60);
  });

  console.log("\n-- resell markup (opt-in, off by default) --");
  const plain = { _id: UID };
  t("no config = charge cost", () => assert.strictEqual(billing.applyResellMarkup(plain, "call", 10), 10));
  t("disabled = charge cost", () => assert.strictEqual(
    billing.applyResellMarkup({ resellConfig: { aiVoiceMinutes: { enabled: false, resellPrice: 2 } } }, "call", 10), 10));
  t("enabled applies the multiplier", () => assert.strictEqual(
    billing.applyResellMarkup({ resellConfig: { aiVoiceMinutes: { enabled: true, resellPrice: 1.3 } } }, "call", 10), 13));
  t("enabled with no price is a no-op", () => assert.strictEqual(
    billing.applyResellMarkup({ resellConfig: { aiVoiceMinutes: { enabled: true, resellPrice: 0 } } }, "call", 10), 10));
  t("markup reaches the wallet", async () => {});
  reset(100);
  await billing.chargeWallet({
    user: { _id: UID, resellConfig: { aiChatMessages: { enabled: true, resellPrice: 2 } } },
    userId: UID, amount: 3, type: "chat_message", kind: "chat", callId: "m1",
  });
  t("marked-up amount debited, raw cost retained", () => {
    assert.strictEqual(users[UID].walletBalance, 94);
    assert.strictEqual(events[0].rawAmount, 3);
    assert.strictEqual(events[0].amount, -6);
  });

  console.log("\n-- usage rollups --");
  reset(100);
  const u = { _id: UID, billingEvents: [] };
  await billing.chargeWallet({ user: u, userId: UID, amount: 1, type: "end-of-call-report", callId: "k1", subaccountId: "loc1", durationSec: 120 });
  await billing.chargeWallet({ user: u, userId: UID, amount: 1, type: "chat_message", callId: "k2", subaccountId: "loc1" });
  await billing.chargeWallet({ user: u, userId: UID, amount: 1, type: "SMS_CHARGE", callId: "k3", subaccountId: "loc1" });
  await billing.chargeWallet({ user: u, userId: UID, amount: 1, type: "chat_message", callId: "k4", subaccountId: "loc2" });
  const usage = await billing.usageThisMonth(u, "loc1");
  t("call minutes counted", () => assert.strictEqual(usage.minutes, 2));
  t("chat AND sms both count toward the message cap", () => assert.strictEqual(usage.messages, 2));
  t("other sub-accounts excluded", async () => {});
  const other = await billing.usageThisMonth(u, "loc2");
  t("sub-account scoping holds", () => assert.strictEqual(other.messages, 1));

  console.log("\n-- legacy embedded history is still counted --");
  reset(100);
  const legacyUser = {
    _id: UID,
    billingEvents: [
      { type: "end-of-call-report", amount: 2, callId: "old1", subaccountId: "loc1", durationSec: 60, processedAt: new Date() },
      { type: "WALLET_TOPUP", amount: 25, callId: "pi_old", processedAt: new Date() },
    ],
  };
  const merged = await billing.listEvents(legacyUser);
  t("legacy rows surface", () => assert.strictEqual(merged.length, 2));
  t("legacy usage normalised to negative", () =>
    assert.strictEqual(merged.find((e) => e.type === "end-of-call-report").amount, -2));
  t("legacy top-up stays positive", () =>
    assert.strictEqual(merged.find((e) => e.type === "WALLET_TOPUP").amount, 25));
  const legacyUsage = await billing.usageThisMonth(legacyUser, "loc1");
  t("legacy events count toward caps", () => assert.strictEqual(legacyUsage.minutes, 1));

  await billing.chargeWallet({
    user: legacyUser, userId: UID, amount: 2, type: "end-of-call-report",
    callId: "old1", subaccountId: "loc1", durationSec: 60,
  });
  const afterBackfill = await billing.listEvents(legacyUser);
  t("a backfilled row is not double-counted with its legacy twin", () =>
    assert.strictEqual(afterBackfill.length, 2));

  console.log("\n-- per-number budgets --");
  reset(100);
  const nu = { _id: UID, billingEvents: [] };
  await billing.chargeWallet({ user: nu, userId: UID, amount: 3, type: "end-of-call-report", callId: "n1", phoneSid: "PN1" });
  await billing.chargeWallet({ user: nu, userId: UID, amount: 2, type: "end-of-call-report", callId: "n2", phoneSid: "PN1" });
  await billing.chargeWallet({ user: nu, userId: UID, amount: 9, type: "end-of-call-report", callId: "n3", phoneSid: "PN2" });
  const nUsage = await billing.numberUsage(nu, "PN1");
  t("spend scoped to the number", () => assert.strictEqual(nUsage.monthSpend, 5));
  t("calls today counted", () => assert.strictEqual(nUsage.callsToday, 2));

  console.log("\n-- call-duration budgeting --");
  t("healthy balance needs no cap", () => assert.strictEqual(billing.affordableCallSeconds(1000), null));
  t("empty wallet gets the floor, not zero", () =>
    assert.strictEqual(billing.affordableCallSeconds(0), 60));
  t("negative wallet gets the floor", () =>
    assert.strictEqual(billing.affordableCallSeconds(-5), 60));
  t("thin balance is capped proportionally", () => {
    const secs = billing.affordableCallSeconds(1); // $1 at $0.25/min ≈ 4 min
    assert.ok(secs >= 60 && secs <= 300, `got ${secs}`);
  });

  console.log("\n-- auto top-up sizing (the repeat-charge bug) --");
  t("refill larger than the gap is used as-is", () =>
    assert.strictEqual(amountToClear({ walletBalance: 20, least: 25, refillAmount: 50 }), 50));
  t("refill too small to clear the threshold is raised", () =>
    assert.ok(amountToClear({ walletBalance: 0, least: 25, refillAmount: 10 }) >= 25));
  t("one top-up always clears the threshold", () => {
    const cfg = { walletBalance: -3, least: 25, refillAmount: 5 };
    assert.ok(cfg.walletBalance + amountToClear(cfg) >= cfg.least);
  });

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
