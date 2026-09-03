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

// ─── Load / create ───────────────────────────────────────────────────────────

// Look up an existing memory. Never creates. Returns null when memory is
// disabled, the identity is unknown, or the customer has opted out.
const loadMemory = async ({ ownerUserId, subaccountId, phone, email, visitorId, widgetId, userId } = {}) => {
  if (!memoryEnabled() || !ownerUserId) return null;
  const identityKey = identityKeyFor({ phone, email, visitorId, widgetId, userId });
  if (!identityKey) return null;

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

  try {
    const memory = await customerMemoryModel.findOneAndUpdate(
      { ownerUserId, subaccountId: subaccountId || "", identityKey },
      {
        $setOnInsert: { ownerUserId, subaccountId: subaccountId || "", identityKey },
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
          subaccountId: subaccountId || "",
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
  if (who.length) parts.push(`Known contact details — ${who.join(", ")}.`);

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
const buildContextBlock = (memory, { assistantNotes, ...opts } = {}) =>
  [buildNotesBlock(assistantNotes), buildMemoryBlock(memory, opts)]
    .filter(Boolean)
    .join("\n\n");

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

const buildAssistantOverrides = async ({ assistantId, memory, assistantNotes, base = {} }) => {
  const block = buildContextBlock(memory, { assistantNotes });
  if (!block) return base;

  const overrides = {
    ...base,
    variableValues: {
      ...(base.variableValues || {}),
      memory: block,
      customerName: memory?.name || "",
      isReturningCustomer: memory?.interactionCount > 0 ? "true" : "false",
    },
  };

  try {
    const assistant = await fetchAssistant(assistantId);

    const model = assistant?.model;
    if (model && typeof model === "object") {
      const messages = Array.isArray(model.messages) ? [...model.messages] : [];
      const systemIndex = messages.findIndex((m) => m.role === "system");
      if (systemIndex >= 0) {
        messages[systemIndex] = {
          ...messages[systemIndex],
          content: `${messages[systemIndex].content || ""}\n\n${block}`,
        };
      } else {
        messages.unshift({ role: "system", content: block });
      }
      overrides.model = { ...model, messages };
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

// POST https://api.vapi.ai/call, retrying once without the model override if
// Vapi rejects it. A memory override must never be the reason a call fails.
const postVapiCall = async (payload) => {
  try {
    return await axios.post("https://api.vapi.ai/call", payload, {
      headers: vapiHeaders(),
      timeout: 30_000,
    });
  } catch (e) {
    const overrodeModel = !!payload?.assistantOverrides?.model;
    if (!overrodeModel || e.response?.status !== 400) throw e;

    console.warn(
      "[customerMemory] Vapi rejected the model override, retrying without it:",
      e.response?.data?.message || e.message,
    );
    const { model, ...restOverrides } = payload.assistantOverrides;
    return axios.post(
      "https://api.vapi.ai/call",
      { ...payload, assistantOverrides: restOverrides },
      { headers: vapiHeaders(), timeout: 30_000 },
    );
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

module.exports = {
  // config
  memoryEnabled,
  CONTEXT_TURNS,
  MAX_BLOCK_CHARS,
  // identity
  normalizePhone,
  normalizeEmail,
  identityKeyFor,
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
  buildContextBlock,
  memorySystemTurns,
  recentTurnsFor,
  // vapi
  buildAssistantOverrides,
  postVapiCall,
  postVapiChat,
  turnsFromArtifact,
  captureVapiCall,
};
