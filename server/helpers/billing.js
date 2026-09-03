// Single entry point for every wallet movement.
//
// Two rules this module exists to enforce:
//
//   1. Money is moved with an atomic $inc, never read-modify-write. The old
//      `user.walletBalance -= x; await user.save()` pattern loses updates when
//      two charges land at once — both read the same balance and the second
//      save silently overwrites the first, so the agency is undercharged.
//
//   2. Every movement is recorded once. Idempotency is enforced by a unique
//      index on (userId, idempotencyKey), so a webhook Vapi retries cannot
//      charge twice — a guarantee an in-memory scan of past events cannot make.

const mongoose = require("mongoose");
const userModel = require("../model/user.model");
const billingEventModel = require("../model/billingEvent.model");

// ─── Prices ──────────────────────────────────────────────────────────────────

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

// What the platform charges an agency on top of provider cost, per billable
// usage event — one voice call, one chat message, one SMS. This is the
// platform's margin and it applies to every agency; it is not something an
// agency configures.
const PLATFORM_FEE = (() => {
  const v = process.env.PLATFORM_FEE_PER_USAGE;
  return v === undefined || v === "" ? 0.05 : num(v);
})();

// An absolute ceiling on call length, in seconds. Opt-in: unset means no cap is
// sent to Vapi at all.
//
// This deliberately does NOT scale with the wallet balance. It used to: the cap
// was derived from balance ÷ an estimated cost per minute, which meant any
// agency under ~$15 had every call hard-terminated by Vapi part-way through —
// four minutes or less under $1. That traded a small, bounded risk (one call
// overshooting the wallet by a few dollars) for a severe one (customer calls
// cut off mid-sentence), which is the wrong way round. Refusing to *start* a
// call on an empty wallet already bounds the exposure to a single call.
const maxCallSeconds = () => num(process.env.MAX_CALL_SECONDS);

// Charge types that represent a voice call, in both the new collection and the
// legacy embedded array.
const CALL_TYPES = ["end-of-call-report", "call.ended", "call.analysis.completed"];
const CHAT_TYPES = ["chat_message"];
const SMS_TYPES = ["SMS_CHARGE"];
const USAGE_TYPES = [...CALL_TYPES, ...CHAT_TYPES, ...SMS_TYPES];
const TOPUP_TYPES = ["WALLET_TOPUP", "AUTO_WALLET_TOPUP"];

// ─── Resell (agency → its own clients) ──────────────────────────────────────

// resellConfig is what an agency charges the people IT resells to. It never
// touches the agency's own wallet — that is always provider cost plus the
// platform fee. Marking resale up must not make the reseller pay us more.
//
// Each bucket is { enabled, resellPrice }, where resellPrice is the agency's
// per-unit price to its client. Disabled by default: an agency sets its own
// prices, and until it does, nothing is rebilled. Consumed by the rebilling
// breakdown in controller/rebilling.controller.js.
const RESELL_BUCKETS = {
  voice: "aiVoiceMinutes",
  chat: "aiChatMessages",
  kb: "voiceKnowledgeBases",
  phone: "phoneNumbers",
};

// The agency's per-unit resale price for one bucket, or null when they have not
// enabled it.
const resellPriceFor = (user, bucket) => {
  const cfg = user?.resellConfig?.[RESELL_BUCKETS[bucket]];
  if (!cfg?.enabled) return null;
  const price = num(cfg.resellPrice);
  return price > 0 ? price : null;
};

// ─── Writing ─────────────────────────────────────────────────────────────────

const keyFor = (type, callId) => (callId ? `${type}:${callId}` : undefined);

// Debit the wallet and record the event. Returns:
//   { charged: true,  amount, rawAmount, platformFee, balance }
//   { charged: false, reason: "duplicate" } — already recorded, nothing moved
//
// The agency is charged provider cost plus one PLATFORM_FEE. Pass
// `platformFee: false` for a movement that is not billable usage.
const chargeWallet = async ({
  user,
  userId,
  amount,
  type,
  callId,
  subaccountId,
  phoneSid,
  durationSec,
  idempotencyKey,
  platformFee = true,
}) => {
  const id = userId || user?._id;
  if (!id || !type) throw new Error("chargeWallet requires userId and type");

  const rawAmount = Math.max(0, num(amount));
  const fee = platformFee ? PLATFORM_FEE : 0;
  // Round to whole hundredths of a cent: provider costs carry long decimals and
  // accumulating their float error across thousands of charges drifts the balance.
  const finalAmount = Math.round((rawAmount + fee) * 1e6) / 1e6;
  const key = idempotencyKey || keyFor(type, callId);

  // Insert first: the unique index is what makes this idempotent. If the row
  // already exists we know the charge landed before and must not repeat it.
  // Insert-before-debit means a crash in between under-charges rather than
  // double-charges, which is the safer direction to fail.
  try {
    await billingEventModel.create({
      userId: id,
      type,
      amount: -finalAmount,
      rawAmount,
      platformFee: fee,
      callId: callId || "",
      subaccountId: subaccountId || "",
      phoneSid: phoneSid || "",
      durationSec: durationSec || undefined,
      idempotencyKey: key,
      processedAt: new Date(),
    });
  } catch (e) {
    if (e.code === 11000) return { charged: false, reason: "duplicate" };
    throw e;
  }

  const updated = await userModel.findByIdAndUpdate(
    id,
    { $inc: { walletBalance: -finalAmount }, $set: { dateUpdated: new Date() } },
    { new: true, select: "walletBalance autoCardPay stripeCustomerId isActive" },
  );

  return {
    charged: true,
    amount: finalAmount,
    rawAmount,
    platformFee: fee,
    balance: updated?.walletBalance ?? null,
  };
};

// Credit the wallet (top-ups). Same idempotency guarantee.
const creditWallet = async ({ userId, amount, type, callId, idempotencyKey }) => {
  const credited = Math.max(0, num(amount));

  try {
    await billingEventModel.create({
      userId,
      type,
      amount: credited,
      callId: callId || "",
      idempotencyKey: idempotencyKey || keyFor(type, callId),
      processedAt: new Date(),
    });
  } catch (e) {
    if (e.code === 11000) return { credited: false, reason: "duplicate" };
    throw e;
  }

  const updated = await userModel.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: credited }, $set: { dateUpdated: new Date() } },
    { new: true, select: "walletBalance" },
  );

  return { credited: true, amount: credited, balance: updated?.walletBalance ?? null };
};

// Record something that moved no money (e.g. a failed top-up attempt).
const recordEvent = async ({ userId, type, amount = 0, callId, idempotencyKey }) => {
  try {
    await billingEventModel.create({
      userId,
      type,
      amount: 0,
      rawAmount: num(amount),
      callId: callId || "",
      idempotencyKey: idempotencyKey || keyFor(type, callId),
      processedAt: new Date(),
    });
    return true;
  } catch (e) {
    if (e.code === 11000) return false;
    throw e;
  }
};

// ─── Reading ─────────────────────────────────────────────────────────────────

// Events written before the collection existed still live on the user document.
// Readers merge both sources until `scripts/backfillBillingEvents.js` has run,
// deduping on idempotency key so a backfilled row is never counted twice.
const legacyEvents = (user, { since, until } = {}) =>
  (user?.billingEvents || [])
    .filter((e) => {
      const t = new Date(e.processedAt || 0);
      if (since && t < since) return false;
      if (until && t > until) return false;
      return true;
    })
    .map((e) => ({
      type: e.type,
      // Legacy rows stored usage as a positive number; normalise to the signed
      // convention the collection uses.
      amount: TOPUP_TYPES.includes(e.type) ? num(e.amount) : -num(e.amount),
      rawAmount: num(e.amount),
      callId: e.callId || "",
      subaccountId: e.subaccountId || "",
      phoneSid: e.phoneSid || "",
      durationSec: e.durationSec,
      processedAt: e.processedAt,
      idempotencyKey: keyFor(e.type, e.callId),
      _legacy: true,
    }));

// All events for a user in a window, from both stores, newest first.
const listEvents = async (user, { since, until, subaccountId, phoneSid } = {}) => {
  const q = { userId: user._id };
  if (since || until) {
    q.processedAt = {};
    if (since) q.processedAt.$gte = since;
    if (until) q.processedAt.$lte = until;
  }
  if (subaccountId) q.subaccountId = subaccountId;
  if (phoneSid) q.phoneSid = phoneSid;

  const rows = await billingEventModel.find(q).lean();
  const seen = new Set(rows.map((r) => r.idempotencyKey).filter(Boolean));

  const legacy = legacyEvents(user, { since, until }).filter((e) => {
    if (e.idempotencyKey && seen.has(e.idempotencyKey)) return false;
    if (subaccountId && e.subaccountId !== subaccountId) return false;
    if (phoneSid && e.phoneSid !== phoneSid) return false;
    return true;
  });

  return [...rows, ...legacy].sort(
    (a, b) => new Date(b.processedAt) - new Date(a.processedAt),
  );
};

const monthStart = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1);
};

// Usage for one sub-account in the current calendar month.
const usageThisMonth = async (user, subaccountId) => {
  const events = await listEvents(user, { since: monthStart(), subaccountId });
  let minutes = 0;
  let messages = 0;
  for (const e of events) {
    if (CALL_TYPES.includes(e.type)) minutes += (e.durationSec || 0) / 60;
    else if (CHAT_TYPES.includes(e.type) || SMS_TYPES.includes(e.type)) messages += 1;
  }
  return { minutes, messages };
};

// Spend and call count for one phone number, for per-number budgets.
const numberUsage = async (user, phoneSid) => {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const events = await listEvents(user, { since: monthStart(), phoneSid });

  const calls = events.filter((e) => CALL_TYPES.includes(e.type));
  return {
    callsToday: calls.filter((e) => new Date(e.processedAt) >= dayStart).length,
    monthSpend: calls.reduce((s, e) => s + Math.abs(e.amount || 0), 0),
  };
};

// ─── Call-duration ceiling ───────────────────────────────────────────────────

// The absolute cap to put on a call, or null for no cap. Independent of the
// wallet — see MAX_CALL_SECONDS above for why.
const callDurationCap = () => {
  const cap = maxCallSeconds();
  return cap > 0 ? cap : null;
};

module.exports = {
  PLATFORM_FEE,
  maxCallSeconds,
  CALL_TYPES,
  CHAT_TYPES,
  SMS_TYPES,
  USAGE_TYPES,
  TOPUP_TYPES,
  RESELL_BUCKETS,
  resellPriceFor,
  chargeWallet,
  creditWallet,
  recordEvent,
  listEvents,
  legacyEvents,
  usageThisMonth,
  numberUsage,
  callDurationCap,
  monthStart,
};
