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

// Flat fee for one outbound SMS segment we send on the agency's behalf. Single
// source of truth: it used to be a magic 0.05 inline in the Vapi tool handler.
const SMS_PRICE = num(process.env.SMS_PRICE) || 0.05;

// Used only to bound how long a call may run on a nearly-empty wallet. A rough
// over-estimate is the safe direction: it shortens the cap.
const ESTIMATED_CALL_COST_PER_MINUTE =
  num(process.env.ESTIMATED_CALL_COST_PER_MINUTE) || 0.25;

// Never let one call run away with the wallet, and never cut a call so short it
// is useless.
const MIN_CALL_SECONDS = 60;
const MAX_CALL_SECONDS = num(process.env.MAX_CALL_SECONDS) || 3600;

// Charge types that represent a voice call, in both the new collection and the
// legacy embedded array.
const CALL_TYPES = ["end-of-call-report", "call.ended", "call.analysis.completed"];
const CHAT_TYPES = ["chat_message"];
const SMS_TYPES = ["SMS_CHARGE"];
const USAGE_TYPES = [...CALL_TYPES, ...CHAT_TYPES, ...SMS_TYPES];
const TOPUP_TYPES = ["WALLET_TOPUP", "AUTO_WALLET_TOPUP"];

// ─── Resell markup ───────────────────────────────────────────────────────────

// resellConfig lets an agency mark usage up before it hits their wallet. Each
// entry is { enabled, resellPrice } and defaults to disabled, so pricing is
// unchanged for every existing account until someone turns it on explicitly.
//
// `resellPrice` is a multiplier on provider cost (1.3 = cost + 30%). A value of
// 0 or less is treated as "not configured" and leaves the cost alone.
const RESELL_KEYS = {
  call: "aiVoiceMinutes",
  chat: "aiChatMessages",
  sms: "aiChatMessages",
  kb: "voiceKnowledgeBases",
  phone: "phoneNumbers",
};

const applyResellMarkup = (user, kind, rawAmount) => {
  const key = RESELL_KEYS[kind];
  const cfg = key && user?.resellConfig?.[key];
  if (!cfg?.enabled) return rawAmount;
  const multiplier = num(cfg.resellPrice);
  if (multiplier <= 0) return rawAmount;
  return Math.round(rawAmount * multiplier * 1e6) / 1e6;
};

// ─── Writing ─────────────────────────────────────────────────────────────────

const keyFor = (type, callId) => (callId ? `${type}:${callId}` : undefined);

// Debit the wallet and record the event. Returns:
//   { charged: true,  amount, balance }  — money moved
//   { charged: false, reason: "duplicate" } — already recorded, nothing moved
//
// `kind` selects the resell bucket ("call" | "chat" | "sms"); omit it to charge
// the raw amount with no markup.
const chargeWallet = async ({
  user,
  userId,
  amount,
  type,
  kind,
  callId,
  subaccountId,
  phoneSid,
  durationSec,
  idempotencyKey,
}) => {
  const id = userId || user?._id;
  if (!id || !type) throw new Error("chargeWallet requires userId and type");

  const rawAmount = Math.max(0, num(amount));
  const finalAmount = kind ? applyResellMarkup(user, kind, rawAmount) : rawAmount;
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

  return { charged: true, amount: finalAmount, rawAmount, balance: updated?.walletBalance ?? null };
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

// ─── Call-duration budgeting ─────────────────────────────────────────────────

// How long a call may run before it would overdraw the wallet. Returns null
// when the balance comfortably covers a full-length call, so no cap is applied.
//
// Without this a single call can drive the balance arbitrarily negative: the
// balance is only checked before the call starts, and nothing bounds the spend
// once it is running.
const affordableCallSeconds = (walletBalance) => {
  const balance = num(walletBalance);
  if (balance <= 0) return MIN_CALL_SECONDS;

  const seconds = Math.floor((balance / ESTIMATED_CALL_COST_PER_MINUTE) * 60);
  if (seconds >= MAX_CALL_SECONDS) return null; // no cap needed
  return Math.max(MIN_CALL_SECONDS, seconds);
};

module.exports = {
  SMS_PRICE,
  ESTIMATED_CALL_COST_PER_MINUTE,
  MAX_CALL_SECONDS,
  CALL_TYPES,
  CHAT_TYPES,
  SMS_TYPES,
  USAGE_TYPES,
  TOPUP_TYPES,
  applyResellMarkup,
  chargeWallet,
  creditWallet,
  recordEvent,
  listEvents,
  legacyEvents,
  usageThisMonth,
  numberUsage,
  affordableCallSeconds,
  monthStart,
};
