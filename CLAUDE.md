# yeshaya

A GoHighLevel-integrated AI voice and chat assistant platform. An agency owns
sub-accounts (one per GoHighLevel location), each with assistants that answer
calls, texts and web chat through Vapi, and write back to the location's CRM.

## Layout

```
server/   Express API. Deployed to Vercel from server/ (api.yashayah.cloud).
client/   React + Vite + Redux Toolkit. Deployed to Vercel from client/.
```

Two Vercel projects from one repo, each rooted at its own directory.

## Branches — read this before assuming a change is live

| What         | Branch        |
| ------------ | ------------- |
| Server / API | `master`      |
| Client / UI  | `projects-ui` |

**Merging to `master` does not deploy the UI.** `projects-ui` is what the client
project builds from. It has silently fallen weeks behind before, so UI work
looked merged while the running app was unchanged — including a bug that was
"fixed" three times because the fix never reached the browser.

`master` is the trunk: everything lands there first. Then fast-forward:

```sh
git push origin origin/master:refs/heads/projects-ui
```

`projects-ui` carries no commits of its own, so this is always a fast-forward.
If it ever isn't, something has been committed there directly — find out what
before forcing anything.

## Commands

```sh
cd server && npm test     # the whole suite, no database or network needed
cd server && npm run dev  # nodemon
cd client && npm run build
cd client && npm run lint # 176 pre-existing errors; compare counts, don't expect zero
```

Tests are plain Node scripts asserting against stubs — no framework, no runner.
Adding one means adding it to the `test` script in `server/package.json`; it is
easy to write a test file that nothing ever runs.

## Serverless constraints

The server runs on Vercel, where **the function is frozen the moment the
response is sent and torn down after**. This has broken the same way three
times, so check for it before adding anything scheduled or deferred:

- **Nothing after `res.json()`.** Detached work — `(async () => {...})()` after
  responding — does not run. Appointments went unstored and confirmations
  unsent this way for weeks. Await it, bounded, before responding.
- **`node-cron` does not fire.** No process stays alive between ticks. Sweeps
  are HTTP endpoints under `/cron/:sweep`, driven by Vercel Cron (see
  `server/vercel.json`) and guarded by `CRON_SECRET`. `node-cron` is kept only
  for a long-running host, guarded on `process.env.VERCEL`.
- **MongoDB change streams do not stay open.** `helpers/autoTopUp.js` used to
  rely on one; it is now called directly after every debit.

Vercel's Hobby plan rejects any cron more frequent than daily at deploy time.

## Working with GoHighLevel

- **API versions differ per group.** Calendars use `Version: 2021-04-15`;
  Contacts use `2021-07-28`. Sending the Contacts version to a calendar
  endpoint returns a shape nothing recognises, which reads as an empty diary —
  every availability check failed this way.
- **Times must be the strings GoHighLevel published.** A booking is matched
  against its own free-slot strings, which carry the calendar's offset
  (`2026-09-10T09:00:00-04:00`). The same instant re-expressed as UTC matches
  nothing and is refused with "The slot you have selected is no longer
  available", on a calendar that is wide open.
- **An invalid email fails the whole contact upsert** with a 422, taking the
  name and custom fields with it. Addresses dictated over the phone rarely
  arrive intact, so `contactIdentity()` drops one that is not an address rather
  than sending it — the caller's number identifies them anyway.
- **Tags are added through `/contacts/{id}/tags`**, never as a `tags` field on
  the upsert. If the upsert replaces rather than appends, that would strip
  every other tag those contacts carry across the whole CRM.
- Confirmations and reminders to the customer are **GoHighLevel's**, sent by
  the calendar's own notification settings. A booking must be created with
  `appointmentStatus: "confirmed"` to trigger them. This codebase can send its
  own instead, behind `SEND_OWN_CONFIRMATION_EMAIL` / `SEND_OWN_REMINDERS`,
  both off.

## Working with Vapi

- **Assistants store their prompt in `model.systemPrompt`**, not
  `model.messages` — see `VAPI_ASSISTANT_CONFIG` and the prompt editor.
  `buildAssistantOverrides()` writes to both, since it is not certain which
  Vapi honours at inference.
- **The model does not know what day it is** unless told. Left to itself it
  answers from training data and books appointments in the past. The date, time
  and timezone are injected into every conversation by `buildTodayBlock()`.
- **Tool arguments arrive as a JSON *string***, per the OpenAI convention —
  destructuring the payload as an object yields undefined for every field.
  Always go through `parseToolArgs()`.
- The tool webhook has ~20s before Vapi gives up and the assistant stalls
  mid-sentence. Every outbound call from it carries `TOOL_HTTP_TIMEOUT_MS`.

## Architecture notes

- `req.user` is the **agency owner**, including for team members. Sub-account
  scoping comes from `accountId`, never from the logged-in user.
- Per-customer memory (`helpers/customerMemory.js`) is keyed by
  `{ownerUserId, subaccountId, identityKey}` — phone, then email, then visitor
  id. It is what lets a caller be recognised across voice, SMS and chat.
- Billing charges `$0.05` per usage. Resale markup belongs at rebilling, not in
  `chargeWallet` — putting it there makes resellers pay the platform more.
  Idempotency is a unique index on `{userId, idempotencyKey}`, not a scan.

## Known loose ends

- `resellConfig` and `snapshot.rebilling` both express agency→client pricing.
  Nobody has said which is canonical, so both are still live.
- `scripts/backfillBillingEvents.js` has not been run against production, and
  the billing tests stub MongoDB — the unique index and `$inc` concurrency are
  unverified against a real database.
