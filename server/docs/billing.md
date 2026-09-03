# Billing

## How money moves

Two layers, now sharing one source of truth.

**The agency wallet (real money).** Agencies top up via Stripe; usage debits
`walletBalance`. Every movement is written to the **`billingEvent` collection**
through `helpers/billing.js` — never by mutating the user document.

| Channel | Charged | Event type |
|---|---|---|
| Voice | call cost + fee | `end-of-call-report` / `call.ended` / `call.analysis.completed` |
| Dashboard chat | chat cost + fee | `chat_message` |
| Widget chat | chat cost + fee | `chat_message` |
| Inbound SMS | chat cost + fee | `SMS_CHARGE` |
| `send_sms` tool | fee only | `SMS_CHARGE` |
| Top-up | — | `WALLET_TOPUP` / `AUTO_WALLET_TOPUP` |

**Rebilling (documents only).** `snapshot.rebilling` sets what an agency charges
*its* clients. `computeBreakdown` multiplies usage × price into a PDF invoice.
No money moves.

## The two invariants

**Atomic.** All wallet movement goes through `chargeWallet` / `creditWallet`,
which use `$inc`. The previous `user.walletBalance -= x; await user.save()`
pattern lost updates whenever two charges overlapped — both read the same
balance and the second save overwrote the first, undercharging the agency.

**Recorded once.** Idempotency is a unique index on
`(userId, idempotencyKey)`, not an in-memory scan of past events. A retried
Vapi webhook or Stripe event cannot charge twice. Voice calls key on
`call:<callId>`, so all three Vapi event types for one call collapse to a single
charge. Events are inserted *before* the balance moves: a crash in between
undercharges rather than double-charges.

## Amount convention

`billingEvent.amount` is **negative for usage, positive for credits**.
`rawAmount` keeps provider cost before markup. The legacy embedded array stored
usage positive and relied on `type` for direction; `billing.legacyEvents()`
normalises it.

## Two prices, two layers

Keeping these apart is the thing to get right.

**The platform fee — what agencies pay us.** `PLATFORM_FEE` ($0.05) is added to
provider cost on every billable usage event: one voice call, one chat message,
one SMS. It applies to every agency and is not configurable by them. This is the
platform's margin, and `chargeWallet` is the only place it is applied.

`rawAmount` and `platformFee` are stored on every event, so total margin over a
period is a sum over those rows — no need to re-derive it from prices.

A call that never connected (no provider cost, no duration) is not usage and is
not billed at all — no fee, no event.

**Resell — what an agency charges *its* clients.** `resellConfig.<bucket>` is
per-unit pricing an agency sets for the people it resells to, and it is
**off by default**: an agency controls its own prices, and until it sets them
nothing is rebilled.

Resell **never touches the agency's own wallet.** The agency always pays
provider cost + platform fee, whether or not it resells. Marking resale up must
not make the reseller pay us more. It is consumed only by the rebilling
breakdown, which turns usage into invoices for the agency's clients.

> Two configs currently express the same thing: `resellConfig` (per bucket) and
> the older `snapshot.rebilling` prices. `resellConfig` wins where it is enabled,
> `snapshot.rebilling` is the fallback. Worth consolidating on one.

## Spend controls

- **Per call.** `affordableCallSeconds()` sets `maxDurationSeconds` on the Vapi
  override when the balance is thin. The balance is only checked *before* a call
  starts, so without this one long call could overdraw without bound.
- **Per number.** `numberSetting.limits` — calls/day and monthly budget.
- **Per sub-account.** `snapshot.limits` — monthly call-minutes and messages.
  Chat and SMS both count toward the message cap.

## Auto top-up

`helpers/autoTopUp.maybeAutoTopUp(userId)` runs after **every debit**. It used
to be driven by a MongoDB change stream in `index.js`, which cannot work on
Vercel's serverless runtime — that listener was not reliably firing, so wallets
could reach zero with no top-up and no warning.

A top-up always clears the threshold: charging only `refillAmount` when it is
smaller than the gap to `least` leaves the balance still under, and the next
debit triggers another charge. `updateAutoChargingSettings` also rejects
`refillAmount < least` up front.

## Migration

Events used to live in an unbounded `billingEvents` array on the user document —
growing forever against Mongo's 16MB limit, and scanned in full on every usage
check.

Readers merge the collection with any remaining embedded history, deduping on
idempotency key, so nothing disappears mid-migration.

```bash
node scripts/backfillBillingEvents.js          # copy into the collection
# verify invoices and usage caps read correctly, then:
node scripts/backfillBillingEvents.js --clear  # empty the arrays
```

## Configuration

| Variable | Default | Effect |
|---|---|---|
| `PLATFORM_FEE_PER_USAGE` | `0.05` | What we charge per billable usage event |
| `ESTIMATED_CALL_COST_PER_MINUTE` | `0.25` | Used only to size the call-duration cap |
| `MAX_CALL_SECONDS` | `3600` | Ceiling for that cap |

## Tests

`npm test` in `server/`. The models are stubbed, including the unique-index
behaviour the idempotency guarantee rests on, so no MongoDB is needed.
**Run against a real MongoDB before shipping** — the unique partial index and
`$inc` concurrency have only been exercised against a fake.
