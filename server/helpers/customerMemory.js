// Per-customer, cross-channel assistant memory.
//
// Read path : loadMemory() → buildMemoryBlock() → injected into the assistant's
//             system prompt (voice) or prepended as a system turn (chat/SMS).
// Write path: recordTurns() / recordInteraction() / upsertFacts() after every
//             call, chat message, SMS, and memory-writing tool call.
//
// Everything here is best-effort by design: a memory failure must never break a
// live call or a customer's chat. Every exported function swallows its own
// errors and degrades to "no memory" rather than throwing into a request path.

const axios = require("axios");
const { OpenAI } = require("openai");
const customerMemoryModel = require("../model/customerMemory.model");

// ─── Tunables ────────────────────────────────────────────────────────────────

// Turns kept verbatim. Older turns are folded into the rolling summary.
const MAX_TURNS = 40;
// Turns actually shown to the model.
//
// This is a latency budget, not a capacity one. The block below is appended to
// the assistant's system prompt, so it is re-sent on EVERY turn of a call —
// tokens here are paid over and over, and on voice they are paid in dead air
// while the caller waits. Injecting a dozen 1200-character turns pushed several
// thousand tokens into every single response.
const CONTEXT_TURNS = 4;
// Prior turns are for orientation, not transcription — a clipped line is enough
// to remind the model what was discussed.
const CONTEXT_TURN_CHARS = 200;
// Hard ceiling on the whole injected block. Whatever the memory holds, this is
// the most that ever reaches the prompt.
const MAX_BLOCK_CHARS = 1400;
const MAX_FACTS = 60;
const MAX_INTERACTIONS = 20;
const MAX_SUMMARY_CHARS = 1500;
const MAX_TURN_CHARS = 1200;

// Global kill switch: set CUSTOMER_MEMORY_ENABLED=false to disable recording
// and injection everywhere without redeploying code changes.
const memoryEnabled = () =>
  String(process.env.CUSTOMER_MEMORY_ENABLED ?? "true").toLowerCase() !== "false";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const vapiHeaders = () => ({
  Authorization: `Bearer ${process.env.VAPI_API_KEY || VAPI_API_KEY}`,
  "Content-Type": "application/json",
});

// ─── Small utilities ─────────────────────────────────────────────────────────

const clip = (s, n) => {
  const str = String(s ?? "").trim();
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
};

// Keep the TAIL when trimming a rolling summary — recent context matters most.
const clipFront = (s, n) => {
  const str = String(s ?? "").trim();
  return str.length > n ? `…${str.slice(str.length - n + 1)}` : str;
};

// Best-effort E.164. Twilio and Vapi both hand us +E.164 already; this mainly
// guards against dashboard-entered numbers like "(555) 123-4567".
const normalizePhone = (raw) => {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  const hadPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  if (hadPlus) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`; // bare US number
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
};

const normalizeEmail = (raw) => String(raw || "").trim().toLowerCase();

// Resolve the stable key this customer is remembered under. Phone wins over
// email (it is the identity voice and SMS actually carry), and an anonymous
// widget visitor falls back to the browser-generated visitor id.
const identityKeyFor = ({ phone, email, visitorId, widgetId, userId } = {}) => {
  const p = normalizePhone(phone);
  if (p) return `phone:${p}`;
  const e = normalizeEmail(email);
  if (e) return `email:${e}`;
  if (visitorId && widgetId) return `visitor:${widgetId}:${String(visitorId).slice(0, 64)}`;
  if (userId) return `user:${userId}`; // dashboard Chat Lab test conversations
  return "";
};

const identityLabel = (memory) => {
  if (!memory) return "";
  return memory.name || memory.phone || memory.email || memory.identityKey || "";
};

// The sub-account a memory belongs to. Memory is scoped per (agency,
// sub-account, customer): two sub-accounts of the same agency are different
// businesses to the caller, and must never see each other's conversations.
//
// A widget that is not tied to a sub-account still gets its own scope, keyed by
// the widget, rather than sharing an agency-wide bucket.
const scopeOf = (subaccountId, widgetId) => {
  const sub = String(subaccountId || "").trim();
  if (sub) return sub;
  if (widgetId) return `widget:${widgetId}`;
  return ""; // unscoped — callers refuse rather than pool
};

// ─── Load / create ───────────────────────────────────────────────────────────

// Look up an existing memory. Never creates. Returns null when memory is
// disabled, the identity is unknown, or the customer has opted out.
const loadMemory = async ({ ownerUserId, subaccountId, phone, email, visitorId, widgetId, userId } = {}) => {
  if (!memoryEnabled() || !ownerUserId) return null;
  const identityKey = identityKeyFor({ phone, email, visitorId, widgetId, userId });
  if (!identityKey) return null;
  if (!scopeOf(subaccountId, widgetId)) return null;

  try {
    const memory = await customerMemoryModel.findOne({
      ownerUserId,
      subaccountId: subaccountId || "",
      identityKey,
    });
    if (!memory || memory.optedOut) return null;
    return memory;
  } catch (e) {
    console.error("[customerMemory] loadMemory failed:", e.message);
    return null;
  }
};

// Load or create. Used on the write path, where we always want a document.
const ensureMemory = async ({
  ownerUserId,
  subaccountId,
  phone,
  email,
  name,
  visitorId,
  widgetId,
  userId,
} = {}) => {
  if (!memoryEnabled() || !ownerUserId) return null;
  const identityKey = identityKeyFor({ phone, email, visitorId, widgetId, userId });
  if (!identityKey) return null;

  const scope = scopeOf(subaccountId, widgetId);
  if (!scope) {
    // Refusing rather than falling back to a blank scope: a blank one is a
    // single shared bucket per agency, so two sub-accounts that both failed to
    // resolve would share one record for the same caller — and each would be
    // read the other's history.
    console.warn(
      `[customerMemory] no sub-account scope for ${identityKey}; not recording.`,
    );
    return null;
  }

  try {
    const memory = await customerMemoryModel.findOneAndUpdate(
      { ownerUserId, subaccountId: scope, identityKey },
      {
        $setOnInsert: { ownerUserId, subaccountId: scope, identityKey },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    if (!memory || memory.optedOut) return null;

    // Fill in contact details as later channels reveal them, without ever
    // overwriting something we already know with a blank.
    const p = normalizePhone(phone);
    const e = normalizeEmail(email);
    if (p && memory.phone !== p) memory.phone = p;
    if (e && memory.email !== e) memory.email = e;
    if (name && !memory.name) memory.name = String(name).trim();

    return memory;
  } catch (e) {
    // A duplicate-key race means a concurrent request just created it.
    if (e.code === 11000) {
      try {
        return await customerMemoryModel.findOne({
          ownerUserId,
          subaccountId: scope,
          identityKey,
        });
      } catch (_) {
        return null;
      }
    }
    console.error("[customerMemory] ensureMemory failed:", e.message);
    return null;
  }
};

// ─── Rolling summary ─────────────────────────────────────────────────────────

// Deterministic fallback when no OpenAI key is configured: keep a trimmed trail
// of what the customer said, which is the part worth remembering.
const fallbackSummary = (existing, evicted) => {
  const lines = (evicted || [])
    .filter((t) => t.role === "user" && String(t.content || "").trim())
    .map((t) => `- [${t.channel || "chat"}] ${clip(t.content, 160)}`);
  return clipFront([existing, ...lines].filter(Boolean).join("\n"), MAX_SUMMARY_CHARS);
};

// Ask OpenAI to fold the evicted turns into the existing summary. Falls back to
// the deterministic version on any failure (no key, quota, network).
const condenseSummary = async ({ apiKey, existing, evicted }) => {
  if (!apiKey || !evicted?.length) return fallbackSummary(existing, evicted);

  try {
    const transcript = evicted
      .map((t) => `${t.role === "user" ? "Customer" : "Assistant"}: ${clip(t.content, 400)}`)
      .join("\n");

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: `You maintain a running memory of one customer for a business's AI assistants.

Merge the EXISTING SUMMARY with the NEW CONVERSATION below into a single updated summary.

Rules:
- Keep durable facts: names, preferences, commitments made, open issues, decisions, dates.
- Drop small talk, greetings, and anything already resolved and closed.
- Write terse third-person bullet points about the customer. No preamble.
- Never invent anything that is not in the text.
- Hard limit: 200 words.

EXISTING SUMMARY:
<<<
${existing || "(none)"}
>>>

NEW CONVERSATION:
<<<
${transcript}
>>>

Output only the updated summary.`,
        },
      ],
    });

    const out = completion.choices?.[0]?.message?.content?.trim();
    return out ? clipFront(out, MAX_SUMMARY_CHARS) : fallbackSummary(existing, evicted);
  } catch (e) {
    console.warn("[customerMemory] summary condense failed, using fallback:", e.message);
    return fallbackSummary(existing, evicted);
  }
};

// ─── Write path ──────────────────────────────────────────────────────────────

// Append turns and persist. `openAIApiKey` is optional and only used when the
// turn cap is exceeded and older turns need folding into the summary.
const recordTurns = async (memory, turns, { channel, assistantId, openAIApiKey } = {}) => {
  if (!memory || !Array.isArray(turns) || !turns.length) return memory;

  try {
    const clean = turns
      .filter((t) => t && typeof t.content === "string" && t.content.trim())
      .filter((t) => t.role === "user" || t.role === "assistant")
      .map((t) => ({
        role: t.role,
        content: clip(t.content, MAX_TURN_CHARS),
        channel: t.channel || channel || "",
        assistantId: t.assistantId || assistantId || "",
        at: t.at ? new Date(t.at) : new Date(),
      }));
    if (!clean.length) return memory;

    memory.turns.push(...clean);

    // Fold anything past the cap into the rolling summary.
    if (memory.turns.length > MAX_TURNS) {
      const evicted = memory.turns.slice(0, memory.turns.length - MAX_TURNS);
      memory.turns = memory.turns.slice(-MAX_TURNS);
      memory.summary = await condenseSummary({
        apiKey: openAIApiKey,
        existing: memory.summary,
        evicted,
      });
    }

    if (channel && !memory.channels.includes(channel)) memory.channels.push(channel);
    if (assistantId) memory.lastAssistantId = assistantId;
    memory.lastInteractionAt = new Date();

    await memory.save();
    return memory;
  } catch (e) {
    console.error("[customerMemory] recordTurns failed:", e.message);
    return memory;
  }
};

// Record a completed interaction.
//
// Idempotent on refId, so a Vapi webhook that fires twice for one call does not
// double-count it. On text channels pass `sessionWindowMinutes`: a back-and-forth
// SMS or chat exchange is one interaction, not one per message, so a new entry is
// only opened once the channel has been quiet for that long.
const recordInteraction = async (
  memory,
  { channel, assistantId, refId, summary, durationSec, sessionWindowMinutes } = {},
) => {
  if (!memory) return memory;

  try {
    if (refId && memory.interactions.some((i) => i.refId === refId)) return memory;

    if (sessionWindowMinutes > 0 && channel) {
      const cutoff = Date.now() - sessionWindowMinutes * 60_000;
      const stillOpen = memory.interactions.some(
        (i) => i.channel === channel && i.at && new Date(i.at).getTime() >= cutoff,
      );
      // Same conversation, still running — just refresh its recency.
      if (stillOpen) {
        memory.lastInteractionAt = new Date();
        await memory.save();
        return memory;
      }
    }

    memory.interactions.push({
      channel: channel || "",
      assistantId: assistantId || "",
      refId: refId || "",
      summary: clip(summary, 800),
      durationSec: durationSec || undefined,
      at: new Date(),
    });
    if (memory.interactions.length > MAX_INTERACTIONS) {
      memory.interactions = memory.interactions.slice(-MAX_INTERACTIONS);
    }

    memory.interactionCount += 1;
    if (channel && !memory.channels.includes(channel)) memory.channels.push(channel);
    if (assistantId) memory.lastAssistantId = assistantId;
    memory.lastInteractionAt = new Date();

    await memory.save();
    return memory;
  } catch (e) {
    console.error("[customerMemory] recordInteraction failed:", e.message);
    return memory;
  }
};

// Merge durable key/value facts. Re-stating a fact updates it in place rather
// than appending a duplicate.
const upsertFacts = async (memory, facts, { source, assistantId } = {}) => {
  if (!memory || !facts) return memory;

  try {
    const entries = Array.isArray(facts)
      ? facts.map((f) => [f.key, f.value])
      : Object.entries(facts);

    let changed = false;
    for (const [rawKey, rawValue] of entries) {
      const key = String(rawKey || "").trim();
      if (!key) continue;
      const value =
        rawValue && typeof rawValue === "object"
          ? clip(JSON.stringify(rawValue), 400)
          : clip(rawValue, 400);
      if (!value) continue;

      const existing = memory.facts.find(
        (f) => f.key.toLowerCase() === key.toLowerCase(),
      );
      if (existing) {
        if (existing.value === value) continue;
        existing.value = value;
        existing.source = source || existing.source;
        existing.assistantId = assistantId || existing.assistantId;
        existing.updatedAt = new Date();
      } else {
        memory.facts.push({
          key,
          value,
          source: source || "",
          assistantId: assistantId || "",
          updatedAt: new Date(),
        });
      }
      changed = true;
    }
    if (!changed) return memory;

    if (memory.facts.length > MAX_FACTS) memory.facts = memory.facts.slice(-MAX_FACTS);
    await memory.save();
    return memory;
  } catch (e) {
    console.error("[customerMemory] upsertFacts failed:", e.message);
    return memory;
  }
};

// Append a free-text note (e.g. from the assistant's add_note tool) to the
// rolling summary, so it is carried into every later conversation.
const appendNote = async (memory, text, { assistantId } = {}) => {
  const note = clip(text, 400);
  if (!memory || !note) return memory;

  try {
    const stamp = new Date().toISOString().slice(0, 10);
    memory.summary = clipFront(
      [memory.summary, `- [${stamp}] ${note}`].filter(Boolean).join("\n"),
      MAX_SUMMARY_CHARS,
    );
    if (assistantId) memory.lastAssistantId = assistantId;
    await memory.save();
    return memory;
  } catch (e) {
    console.error("[customerMemory] appendNote failed:", e.message);
    return memory;
  }
};

// ─── Read path ───────────────────────────────────────────────────────────────

// Render memory as a prompt block. Returns "" when there is nothing worth
// injecting, so callers can skip the override entirely.
// `assistantId` scopes the replayed turns to one assistant. Leave it unset for
// real customers — the whole point is that memory follows the person across the
// sub-account's assistants — and set it for the dashboard's Chat Lab, where two
// assistants being tested by the same person must not see each other's threads.
const buildMemoryBlock = (memory, { maxTurns = CONTEXT_TURNS, assistantId } = {}) => {
  if (!memory || memory.optedOut) return "";

  const parts = [];
  // Ordered most- to least-useful, because the tail is what gets trimmed when
  // the block exceeds its budget.

  const who = [
    memory.name && `name: ${memory.name}`,
    memory.phone && `phone: ${memory.phone}`,
    memory.email && `email: ${memory.email}`,
  ].filter(Boolean);
  if (who.length) {
    // Stated as an instruction, not a fact. The assistants' own prompts tell
    // them to ask for a name to personalise the conversation, so simply listing
    // what is known is not enough to stop them asking a returning caller for
    // details they already gave.
    parts.push(
      [
        `You ALREADY have this person's details: ${who.join(", ")}.`,
        memory.name
          ? `Greet them by name (${memory.name.split(/\s+/)[0]}) and do NOT ask for their name.`
          : "",
        "Do NOT ask for any detail listed above — you have it. Ask only for what is genuinely missing.",
      ].filter(Boolean).join(" "),
    );
  }

  if (memory.interactionCount > 0) {
    const last = memory.lastInteractionAt
      ? new Date(memory.lastInteractionAt).toISOString().slice(0, 10)
      : "unknown date";
    const channels = memory.channels?.length ? memory.channels.join(", ") : "unknown";
    parts.push(
      `You have spoken with this person ${memory.interactionCount} time(s) before (channels: ${channels}; most recent: ${last}).`,
    );
  }

  if (memory.summary) parts.push(`What you know so far:\n${memory.summary}`);

  if (memory.facts?.length) {
    const facts = memory.facts
      .slice(-10)
      .map((f) => `- ${f.key}: ${clip(f.value, 120)}`)
      .join("\n");
    parts.push(`Confirmed details:\n${facts}`);
  }

  if (memory.interactions?.length) {
    const recent = memory.interactions
      .filter((i) => i.summary)
      .slice(-2)
      .map((i) => `- [${i.channel || "?"}] ${clip(i.summary, 200)}`)
      .join("\n");
    if (recent) parts.push(`Recent interactions:\n${recent}`);
  }

  if (memory.turns?.length && maxTurns > 0) {
    const recent = memory.turns
      .filter((t) => !assistantId || t.assistantId === assistantId)
      .slice(-maxTurns)
      .map((t) => `${t.role === "user" ? "Customer" : "You"}: ${clip(t.content, CONTEXT_TURN_CHARS)}`)
      .join("\n");
    if (recent) parts.push(`Most recent messages:\n${recent}`);
  }

  if (!parts.length) return "";

  const body = [
    "## Customer memory",
    "This is a returning customer. The notes below come from your previous conversations with them across phone, SMS, and chat.",
    "Use them to stay consistent and avoid asking again for anything you already know. Do not read this section aloud or mention that you have notes. If the customer contradicts a note, trust the customer and continue.",
    "",
    ...parts,
  ].join("\n");

  // Trim from the tail: the header and contact details matter more than the
  // oldest replayed turn.
  return body.length > MAX_BLOCK_CHARS ? `${body.slice(0, MAX_BLOCK_CHARS - 1)}…` : body;
};

// The assistant's own team notes — knowledge about the business that applies to
// every customer, as opposed to memory, which is about one customer. These are
// written from the dashboard's Team Notes panel and by the add_note tool, whose
// description has always promised they would be "remembered for future
// conversations"; this is what makes that true.
const buildNotesBlock = (notes) => {
  const text = String(notes || "").trim();
  if (!text) return "";
  return [
    "## Team notes",
    "Standing notes from the team that apply to every conversation. Follow them. Do not read them aloud or mention that they exist.",
    "",
    // Also re-sent on every turn, so it carries the same latency budget as the
    // memory block above.
    clip(text, 1200),
  ].join("\n");
};

// Memory block + team notes, in the order they should reach the model.
// What day it is.
//
// Nothing in this codebase ever told the assistant, so the model answered from
// its training data — offering appointments in June 2024 and computing "next
// Tuesday" from a date two years gone. Every date it produced was wrong, which
// is why availability was being checked for days in the past.
//
// The zone matters as much as the date: near midnight the day itself differs,
// and "this afternoon" is meaningless without knowing what time it is where the
// business is. When the sub-account's timezone is not known, UTC is stated
// rather than implied, so the model does not silently assume local time.
const buildTodayBlock = (timezone, now = new Date()) => {
  const zone = isValidTimeZone(timezone) ? timezone : "UTC";
  const fmt = (opts) =>
    new Intl.DateTimeFormat("en-US", { timeZone: zone, ...opts }).format(now);

  const date = fmt({ weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const time = fmt({ hour: "numeric", minute: "2-digit", hour12: true });
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);

  return [
    "## Today",
    `It is ${date}, ${time} (${zone}). The ISO date is ${iso}.`,
    "Work out every date the customer mentions — today, tomorrow, next Tuesday — from this, never from anything you think you know. Your own idea of the current date is wrong.",
    "When a tool takes a date, give it in this timezone.",
  ].join("\n");
};

// Today's date in the business's zone, as YYYY-MM-DD.
const currentIsoDate = (timezone, now = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: isValidTimeZone(timezone) ? timezone : "UTC",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);

// True only for a zone this runtime's tz data knows.
const isValidTimeZone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const buildContextBlock = (memory, { assistantNotes, caller, timezone, ...opts } = {}) =>
  [
    buildTodayBlock(timezone),
    buildNotesBlock(assistantNotes),
    buildCallBlock(caller),
    buildMemoryBlock(memory, opts),
  ]
    .filter(Boolean)
    .join("\n\n");

// Facts about the call happening right now, as opposed to remembered ones.
//
// The caller's number is known from the moment the phone rings, so an assistant
// asking an inbound caller to read it out is asking for something the system is
// already holding. It used to, because everything injected here was derived
// from memory, and a first-time caller has none — so on the call where details
// are actually being collected, the assistant knew the least.
const buildCallBlock = ({ number, name } = {}) => {
  if (!number) return "";
  return [
    "## This call",
    `The person on this call is contacting you from ${number}.`,
    "You ALREADY have their phone number — never ask them to read it out, and never ask them to confirm it unless they bring it up themselves.",
    "When a tool needs their phone number, use this one. It is attached to their CRM record automatically.",
    // Assistants configured before this existed carry prompts that tell them to
    // collect a phone number. This block is appended after those instructions
    // and has to win, so say so rather than leaving the model to weigh two
    // contradictory orders.
    "This overrides anything earlier in your instructions about collecting or asking for a phone number.",
    name ? `Their name is ${name}.` : "",
  ].filter(Boolean).join("\n");
};

// A system turn carrying the memory block, for the /chat API where we control
// the message array directly. Returns [] when there is nothing to inject.
const memorySystemTurns = (memory, opts) => {
  const block = buildContextBlock(memory, opts);
  return block ? [{ role: "system", content: block }] : [];
};

// The turns to replay as conversational context on a text channel. `assistantId`
// scopes them the same way it does in buildMemoryBlock.
const recentTurnsFor = (memory, { limit = CONTEXT_TURNS, assistantId } = {}) =>
  !memory?.turns?.length
    ? []
    : memory.turns
        .filter((t) => !assistantId || t.assistantId === assistantId)
        .slice(-limit)
        .map((t) => ({ role: t.role, content: t.content }));

// ─── Vapi call helpers ───────────────────────────────────────────────────────

// Build assistantOverrides that carry the memory into a voice call.
//
// Two mechanisms, belt and braces:
//   1. variableValues.memory — works if the prompt uses {{memory}}.
//   2. A model override that appends the block to the assistant's own system
//      prompt — works with no prompt changes at all. Requires reading the
//      assistant back from Vapi so the rest of its model config is preserved.
// The assistant's own config, briefly cached. Reading it back from Vapi sits on
// the path between a call arriving and being answered, so the round-trip is
// time-to-answer the caller experiences as silence. Assistant configs change
// rarely; a short TTL removes the round-trip for back-to-back calls without
// holding a stale prompt for long.
const ASSISTANT_CACHE_TTL_MS = 60_000;
const assistantCache = new Map();

const fetchAssistant = async (assistantId) => {
  const hit = assistantCache.get(assistantId);
  if (hit && Date.now() - hit.at < ASSISTANT_CACHE_TTL_MS) return hit.data;

  const { data } = await axios.get(`https://api.vapi.ai/assistant/${assistantId}`, {
    headers: vapiHeaders(),
    timeout: 10_000,
  });
  assistantCache.set(assistantId, { at: Date.now(), data });
  return data;
};

// Only the fields Vapi's model DTOs actually accept.
//
// `GET /assistant/{id}` returns more than it takes back: server-generated ids,
// timestamps and org ids, on the model and inside every tool. Spreading that
// response into a call override sends all of it back as a model to run — and a
// model Vapi cannot construct is an assistant that answers, has nothing to say,
// and hangs up a few seconds later.
//
// The list is from @vapi-ai/server-sdk's own model types, plus `systemPrompt`,
// which the assistants here are created with.
const WRITABLE_MODEL_FIELDS = [
  "provider",
  "model",
  "messages",
  "systemPrompt",
  "temperature",
  "maxTokens",
  "toolIds",
  "tools",
  "knowledgeBase",
  "knowledgeBaseId",
  "fallbackModels",
  "emotionRecognitionEnabled",
  "numFastTurns",
  "toolStrictCompatibilityMode",
];

// Keep only what may be written, and reference saved tools by id rather than
// sending their whole definition back — a tool that came back from a GET with
// an id already exists, and re-sending its body is what a create expects, not
// an override.
const modelForOverride = (model) => {
  const out = {};
  for (const key of WRITABLE_MODEL_FIELDS) {
    if (model[key] !== undefined) out[key] = model[key];
  }

  if (Array.isArray(out.tools)) {
    const toolIds = new Set(Array.isArray(out.toolIds) ? out.toolIds : []);
    const transient = [];
    for (const tool of out.tools) {
      if (tool && typeof tool === "object" && tool.id) toolIds.add(tool.id);
      else if (tool) transient.push(tool);
    }
    if (transient.length) out.tools = transient;
    else delete out.tools;
    if (toolIds.size) out.toolIds = [...toolIds];
  }

  return out;
};

const buildAssistantOverrides = async ({
  assistantId,
  memory,
  assistantNotes,
  caller,
  timezone,
  base = {},
}) => {
  const block = buildContextBlock(memory, { assistantNotes, caller, timezone });
  if (!block) return base;

  const overrides = {
    ...base,
    variableValues: {
      ...(base.variableValues || {}),
      memory: block,
      // Available to prompts as {{customerPhone}} / {{customerName}} even on a
      // first call, when there is no memory to draw a name from yet.
      customerPhone: caller?.number || memory?.phone || "",
      customerName: memory?.name || caller?.name || "",
      isReturningCustomer: memory?.interactionCount > 0 ? "true" : "false",
      // So a prompt can use {{currentDate}} directly if it wants to.
      currentDate: currentIsoDate(timezone),
      currentTimezone: isValidTimeZone(timezone) ? timezone : "UTC",
    },
  };

  // Prompt injection is OFF unless deliberately switched on, because it took
  // inbound calls down: the assistant answered, said nothing, and hung up.
  //
  // Two things are wrong with it, and both are on the path between a caller
  // ringing and hearing anything.
  //
  // It reads the assistant back from Vapi on every call. The cache below was
  // supposed to make that rare, but a serverless invocation is a fresh process
  // — the Map is always empty, so the cache never hit once in production and
  // every call paid for a round trip to api.vapi.ai before it could be placed.
  //
  // And it replaces the assistant's model for the duration of the call. An
  // override Vapi accepts but cannot run leaves an assistant with nothing to
  // say, and postVapiCall only degrades on a 400, so a request accepted and
  // then failing at runtime never falls back.
  //
  // Bringing it back means removing the live fetch — keeping the prompt where
  // this codebase can already reach it, rather than asking Vapi for it while
  // someone waits. Until then {{memory}} and the variables below still work
  // for prompts that use them; those cost nothing.
  if (process.env.VAPI_PROMPT_INJECTION !== "on") {
    return overrides;
  }
  console.warn(
    "[customerMemory] VAPI_PROMPT_INJECTION=on — the assistant is read from Vapi on " +
      "every call and its model is replaced. This has taken inbound calls down before.",
  );

  try {
    const assistant = await fetchAssistant(assistantId);

    const model = assistant?.model;
    if (model && typeof model === "object") {
      // Vapi holds a system prompt in one of two places, and this codebase
      // creates assistants in the older shape: assistant.controller.js sends
      // `model.systemPrompt`, and the prompt editor reads it back from there.
      // Appending only to `model.messages` therefore appended to an empty
      // array, and whichever field Vapi honours at inference, half the prompt
      // was in the other one. So write the combined text to BOTH: the
      // assistant's own instructions and this block stay together either way.
      const legacyPrompt =
        typeof model.systemPrompt === "string" ? model.systemPrompt : "";
      const messages = Array.isArray(model.messages) ? [...model.messages] : [];
      const systemIndex = messages.findIndex((m) => m.role === "system");
      const msgPrompt = systemIndex >= 0 ? messages[systemIndex].content || "" : "";
      // Vapi may mirror systemPrompt into messages. Keep whatever each holds,
      // but do not hand the model the same instructions twice.
      const parts = [];
      if (legacyPrompt) parts.push(legacyPrompt);
      if (msgPrompt && !legacyPrompt.includes(msgPrompt)) parts.push(msgPrompt);
      const existing = parts.join("\n\n");
      const combined = existing ? `${existing}\n\n${block}` : block;

      if (systemIndex >= 0) {
        messages[systemIndex] = { ...messages[systemIndex], content: combined };
      } else {
        messages.unshift({ role: "system", content: combined });
      }

      overrides.model = modelForOverride({ ...model, messages });
      if (legacyPrompt) overrides.model.systemPrompt = combined;

      console.log(
        `[customerMemory] injecting ${block.length} chars into ${assistantId} (` +
          `${legacyPrompt ? "systemPrompt+messages" : "messages"} shape)`,
      );
    } else {
      console.warn(
        `[customerMemory] assistant ${assistantId} has no model object — context block not injected`,
      );
    }
  } catch (e) {
    // Prompt injection is a bonus; {{memory}} substitution still works.
    console.warn(
      "[customerMemory] could not read assistant for prompt injection:",
      e.response?.data?.message || e.message,
    );
  }

  return overrides;
};

// POST https://api.vapi.ai/call. If Vapi rejects the model override, shed it
// a piece at a time — the legacy `systemPrompt` field first, then the whole
// model — so the context block is given up only as far as Vapi forces. A memory
// override must never be the reason a call fails.
const postVapiCall = async (payload) => {
  const post = (body) =>
    axios.post("https://api.vapi.ai/call", body, {
      headers: vapiHeaders(),
      timeout: 30_000,
    });

  try {
    return await post(payload);
  } catch (e) {
    const model = payload?.assistantOverrides?.model;
    if (!model || e.response?.status !== 400) throw e;

    // `systemPrompt` is the legacy prompt field. Vapi accepts it when creating
    // an assistant, but if its override schema does not, dropping just that
    // field keeps the block in `messages` rather than losing it altogether.
    if (model.systemPrompt) {
      const { systemPrompt: _legacy, ...restModel } = model;
      console.warn(
        "[customerMemory] Vapi rejected the model override; retrying without systemPrompt:",
        e.response?.data?.message || e.message,
      );
      try {
        return await post({
          ...payload,
          assistantOverrides: { ...payload.assistantOverrides, model: restModel },
        });
      } catch (e2) {
        if (e2.response?.status !== 400) throw e2;
        e = e2;
      }
    }

    console.warn(
      "[customerMemory] Vapi rejected the model override, retrying without it:",
      e.response?.data?.message || e.message,
    );
    const { model: _dropped, ...restOverrides } = payload.assistantOverrides;
    return post({ ...payload, assistantOverrides: restOverrides });
  }
};

// POST https://api.vapi.ai/chat, retrying once without the leading system turn
// if Vapi rejects the role. Same principle as postVapiCall.
const postVapiChat = async (payload) => {
  try {
    return await axios.post("https://api.vapi.ai/chat", payload, {
      headers: vapiHeaders(),
      timeout: 60_000,
    });
  } catch (e) {
    const hasSystem = Array.isArray(payload?.input) && payload.input.some((m) => m.role === "system");
    if (!hasSystem || e.response?.status !== 400) throw e;

    console.warn(
      "[customerMemory] Vapi rejected the system turn, retrying without it:",
      e.response?.data?.message || e.message,
    );
    return axios.post(
      "https://api.vapi.ai/chat",
      { ...payload, input: payload.input.filter((m) => m.role !== "system") },
      { headers: vapiHeaders(), timeout: 60_000 },
    );
  }
};

// ─── Vapi end-of-call extraction ─────────────────────────────────────────────

// Pull conversational turns out of an end-of-call-report artifact. Vapi gives
// either a structured message list or a flat transcript string.
const turnsFromArtifact = (artifact, messages) => {
  const source = Array.isArray(messages)
    ? messages
    : Array.isArray(artifact?.messages)
      ? artifact.messages
      : null;

  if (source) {
    return source
      .filter((m) => m && (m.role === "user" || m.role === "bot" || m.role === "assistant"))
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.message ?? m.content ?? "").trim(),
      }))
      .filter((m) => m.content);
  }

  const transcript = artifact?.transcript;
  if (typeof transcript !== "string" || !transcript.trim()) return [];

  // Flat transcript format: "User: hi\nAI: hello\n..."
  return transcript
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(user|customer|ai|bot|assistant)\s*:\s*(.+)$/i);
      if (!m) return null;
      const role = /^(user|customer)$/i.test(m[1]) ? "user" : "assistant";
      return { role, content: m[2].trim() };
    })
    .filter(Boolean);
};

// One-shot capture of a completed Vapi voice call into customer memory.
//
// Deliberately skips calls that carry no content, so a bare "call.ended" event
// does not create an empty interaction that would then dedupe away the richer
// "end-of-call-report" arriving moments later. Dedupes on the Vapi call id, so
// it is safe to invoke for every webhook event Vapi sends for one call.
const captureVapiCall = async ({
  user,
  call,
  artifact,
  analysis,
  messages,
  subaccountId,
  durationSec,
  channel = "call",
} = {}) => {
  if (!memoryEnabled() || !user || !call?.id) return null;

  try {
    const turns = turnsFromArtifact(artifact, messages);
    const summary = analysis?.summary || "";
    const structured = analysis?.structuredData;

    // Nothing worth remembering yet — let a later event carry the transcript.
    if (!turns.length && !summary && !structured) return null;

    const phone = call.customer?.number || call.customer?.phoneNumber || "";
    const memory = await ensureMemory({
      ownerUserId: user._id,
      subaccountId,
      phone,
    });
    if (!memory) return null;

    // Already captured from an earlier event for this same call.
    if (memory.interactions.some((i) => i.refId === call.id)) return memory;

    if (turns.length) {
      await recordTurns(memory, turns, {
        channel,
        assistantId: call.assistantId,
        openAIApiKey: user.openAIApiKey,
      });
    }
    if (structured && typeof structured === "object") {
      await upsertFacts(memory, structured, {
        source: channel,
        assistantId: call.assistantId,
      });
    }
    await recordInteraction(memory, {
      channel,
      assistantId: call.assistantId,
      refId: call.id,
      summary,
      durationSec,
    });

    return memory;
  } catch (e) {
    console.error("[customerMemory] captureVapiCall failed:", e.message);
    return null;
  }
};

// Turn stored memories into contact rows for the dashboard.
//
// A memory exists for every person an assistant actually spoke to, so this is
// the answer to "which contacts did our assistants gather?" — as opposed to the
// whole CRM address book, most of which the assistants never touched.
//
// Two identity kinds are deliberately excluded:
//   - "user:"    the dashboard's own Chat Lab test threads. Staff testing an
//                assistant are not customers.
//   - "visitor:" an anonymous website visitor who never gave a name, email or
//                phone. There is nothing to contact them by.
const memoryToContact = (m) => {
  const identity = String(m.identityKey || "");
  if (identity.startsWith("user:")) return null;

  const name = String(m.name || "").trim();
  const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);

  if (identity.startsWith("visitor:") && !m.phone && !m.email && !name) return null;

  return {
    id: String(m._id),
    firstName: firstName || "",
    lastName: rest.join(" "),
    email: m.email || "",
    phone: m.phone || "",
    company: "",
    title: "",
    ghlContactId: m.ghlContactId || "",
    // What the assistants know about them, which is the point of this view.
    channels: m.channels || [],
    interactionCount: m.interactionCount || 0,
    lastInteractionAt: m.lastInteractionAt || null,
    factCount: (m.facts || []).length,
    createdAt: m.createdAt,
    source: "assistant",
  };
};

// Contacts an agency's assistants gathered, newest conversation first.
const contactsFromMemory = async ({ ownerUserId, subaccountId }) => {
  if (!ownerUserId) return [];
  const q = { ownerUserId };
  if (subaccountId) q.subaccountId = subaccountId;

  const rows = await customerMemoryModel
    .find(q)
    .sort({ lastInteractionAt: -1, updatedAt: -1 })
    .lean();

  return rows.map(memoryToContact).filter(Boolean);
};

module.exports = {
  // config
  memoryEnabled,
  CONTEXT_TURNS,
  MAX_BLOCK_CHARS,
  // identity
  normalizePhone,
  normalizeEmail,
  identityKeyFor,
  scopeOf,
  identityLabel,
  // load
  loadMemory,
  ensureMemory,
  // write
  recordTurns,
  recordInteraction,
  upsertFacts,
  appendNote,
  // read
  buildMemoryBlock,
  buildNotesBlock,
  buildCallBlock,
  buildContextBlock,
  memorySystemTurns,
  recentTurnsFor,
  // vapi
  buildAssistantOverrides,
  modelForOverride,
  buildTodayBlock,
  currentIsoDate,
  postVapiCall,
  postVapiChat,
  turnsFromArtifact,
  captureVapiCall,
  memoryToContact,
  contactsFromMemory,
};
