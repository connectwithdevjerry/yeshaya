#!/usr/bin/env node
// One-off migration: copy each user's embedded `billingEvents` array into the
// billingEvent collection, then (optionally) clear the array.
//
// Readers merge both stores and dedupe on idempotency key, so running this is
// safe at any time and is idempotent — re-running it inserts nothing new.
//
//   node scripts/backfillBillingEvents.js            # copy only
//   node scripts/backfillBillingEvents.js --clear    # copy, then empty the arrays
//
// Run the copy first, confirm invoices and usage caps still read correctly,
// and only then re-run with --clear.

require("dotenv").config();
const mongoose = require("mongoose");
const userModel = require("../model/user.model");
const billingEventModel = require("../model/billingEvent.model");
const billing = require("../helpers/billing");

const CLEAR = process.argv.includes("--clear");

(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("connected");

  let users = 0;
  let inserted = 0;
  let skipped = 0;

  const cursor = userModel.find({ "billingEvents.0": { $exists: true } }).cursor();

  for await (const user of cursor) {
    users += 1;
    const rows = billing.legacyEvents(user).map((e) => ({
      userId: user._id,
      type: e.type,
      amount: e.amount,
      rawAmount: e.rawAmount,
      callId: e.callId,
      subaccountId: e.subaccountId,
      phoneSid: e.phoneSid,
      durationSec: e.durationSec,
      idempotencyKey: e.idempotencyKey,
      processedAt: e.processedAt,
    }));

    for (const row of rows) {
      try {
        await billingEventModel.create(row);
        inserted += 1;
      } catch (err) {
        if (err.code === 11000) skipped += 1; // already migrated
        else throw err;
      }
    }

    if (CLEAR) {
      await userModel.updateOne({ _id: user._id }, { $set: { billingEvents: [] } });
    }

    console.log(`  ${user.email || user._id}: ${rows.length} events`);
  }

  console.log(`\ndone — ${users} users, ${inserted} inserted, ${skipped} already present`);
  if (!CLEAR) console.log("arrays left in place; re-run with --clear once verified");

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("backfill failed:", err);
  process.exit(1);
});
