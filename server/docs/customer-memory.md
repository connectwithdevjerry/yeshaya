# Per-customer assistant memory

Assistants remember the people they talk to, across phone calls, SMS, the
dashboard Chat Lab, and the embedded web widget. A caller who books an
appointment by phone on Monday and texts on Wednesday reaches an assistant that
already knows who they are and what was agreed.

## Model

`customerMemory` — one document per **(agency owner, sub-account, customer
identity)**.

| Field | Purpose |
|---|---|
| `identityKey` | Normalized identity: `phone:+1555…`, `email:a@b.com`, `visitor:<widgetId>:<uuid>`, or `user:<memberId>` for Chat Lab tests |
| `summary` | Rolling natural-language summary of everything older than the kept turns |
| `facts` | Durable key/value details (`vehicle: 2019 Civic`) |
| `turns` | Last 40 turns verbatim, each tagged with channel and assistant |
| `interactions` | Last 20 calls/chat sessions, with Vapi id and summary |
| `optedOut` | Stop recording and injecting without deleting the record |

Memory is scoped to the **sub-account**, not to one assistant: a caller who
reaches the receptionist and then support is the same customer of the same
business. Every turn and fact records the `assistantId` that produced it, so
provenance is kept and a per-assistant view can be filtered out of the same
collection. The Chat Lab is the deliberate exception — test threads are scoped to
one assistant so two assistants under test never see each other's conversations.

Identity precedence is **phone → email → visitor id**. Anonymous widget visitors
get a browser-scoped id; once the host page identifies them (see below), they
merge into the same record as their calls and texts.

## How it flows

**Write.** `end-of-call-report` from the Vapi webhook (transcript, analysis
summary, `structuredData`), every chat/SMS/widget message, and the
`update_user_details` and `add_note` tools. Call capture dedupes on the Vapi call
id and ignores contentless events, so repeated webhooks are safe. Text channels
count a whole back-and-forth as one interaction via a 30-minute session window.

**Read.** Rendered as a prompt block and injected two ways on voice calls: the
assistant is read back from Vapi and the block is *appended* to its own system
prompt (nothing is replaced), and `{{memory}}` / `{{customerName}}` /
`{{isReturningCustomer}}` are supplied as template variables. On text channels the
block is prepended as a `system` turn.

Assistant-level **team notes** ride the same path. The `add_note` tool has always
described notes as "remembered for future conversations"; before this they were
stored but never reached the model. They now do, on every channel.

## Failure behaviour

Memory must never break a live conversation, so:

- Every helper swallows its own errors and degrades to "no memory".
- If the assistant can't be read from Vapi, the prompt override is skipped and
  `{{memory}}` still works.
- If Vapi rejects the model override (400), the call is retried once without it.
- If Vapi rejects the `system` turn (400), the chat is retried once without it.
- Non-400 errors propagate untouched — those are real failures.

## Configuration

| Variable | Default | Effect |
|---|---|---|
| `CUSTOMER_MEMORY_ENABLED` | `true` | `false` disables all recording and injection |
| `SESSION_SECRET` | falls back to the previous hardcoded value | Express session secret |

Summarization uses the agency's own `openAIApiKey` (`gpt-4o-mini`) when one is
connected; without a key it falls back to a deterministic trail of what the
customer said, so nothing depends on OpenAI being configured.

## API

Mounted at `/memory`. Reads are open to any signed-in team member; writes and
deletes require owner/admin. Every query is scoped by the agency owner.

```
GET    /memory/list?subaccountId=&q=&page=&limit=
GET    /memory/detail?id=
PUT    /memory/update        { id, summary?, facts?, name? }
PUT    /memory/opt-out       { id, optedOut }
DELETE /memory/delete?id=

GET    /memory/chat-history?assistantId=      # Chat Lab thread
DELETE /memory/chat-history?assistantId=      # "start over"
```

`opt-out` and `delete` are the erasure controls: opt-out stops recording while
preserving history, delete is permanent.

## Widget identification

The embed script keeps a per-browser visitor id automatically. To join a chat up
with the same person's calls and texts, identify them:

```html
<script src="https://api.example.com/embed/widget.js"
        data-widget-id="wgt_xxx"
        data-contact-email="dana@example.com" async></script>
```

or after login:

```js
window.YashayahWidget.identify({ email: "dana@example.com", phone: "+15551234567" });
```

## Tests

`npm test` in `server/`. The suite stubs the model and axios, so it needs no
MongoDB or network. Schema rules are checked offline with `validateSync()`.
