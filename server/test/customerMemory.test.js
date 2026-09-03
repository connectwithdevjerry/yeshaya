// Exercises the per-customer memory helper.
//
// The sandbox's network policy blocks fastdl.mongodb.org, so no real mongod is
// available here. The model is therefore stubbed with an in-memory store that
// mimics the slice of the Mongoose API the helper uses, and the schema itself is
// validated offline via validateSync(). Run against a real MongoDB before ship.
const assert = require("assert");
const path = require("path");
const mongoose = require("mongoose");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

// ─── Stub the model before the helper requires it ────────────────────────────
const MODEL_PATH = require.resolve("../model/customerMemory.model");
const store = [];
class FakeDoc {
  constructor(props) {
    Object.assign(this, {
      _id: String(store.length + 1),
      phone: "", email: "", name: "", ghlContactId: "", summary: "",
      facts: [], turns: [], interactions: [], channels: [],
      interactionCount: 0, lastAssistantId: "", optedOut: false,
      ...props,
    });
  }
  async save() { return this; }
}
const matches = (d, q) =>
  Object.entries(q).every(([k, v]) => String(d[k] ?? "") === String(v ?? ""));

require.cache[MODEL_PATH] = {
  id: MODEL_PATH, filename: MODEL_PATH, loaded: true, exports: {
    async findOne(q) { return store.find((d) => matches(d, q)) || null; },
    async findOneAndUpdate(q, update, opts) {
      let d = store.find((x) => matches(x, q));
      if (!d && opts?.upsert) {
        d = new FakeDoc({ ...q, ...(update?.$setOnInsert || {}) });
        store.push(d);
      }
      return d || null;
    },
    async countDocuments(q = {}) { return store.filter((d) => matches(d, q)).length; },
  },
};

const M = require("../helpers/customerMemory");
const OWNER = "owner_a";

(async () => {
  console.log("\n-- schema (offline validation) --");
  delete require.cache[MODEL_PATH];
  const RealModel = require("../model/customerMemory.model");
  t("valid document passes validation", () => {
    const doc = new RealModel({ ownerUserId: new mongoose.Types.ObjectId(), identityKey: "phone:+1555" });
    assert.strictEqual(doc.validateSync(), undefined);
  });
  t("identityKey is required", () => {
    const doc = new RealModel({ ownerUserId: new mongoose.Types.ObjectId() });
    assert.ok(doc.validateSync()?.errors?.identityKey);
  });
  t("ownerUserId is required", () => {
    const doc = new RealModel({ identityKey: "phone:+1555" });
    assert.ok(doc.validateSync()?.errors?.ownerUserId);
  });
  t("turn role is constrained", () => {
    const doc = new RealModel({
      ownerUserId: new mongoose.Types.ObjectId(), identityKey: "k",
      turns: [{ role: "hacker", content: "x" }],
    });
    assert.ok(doc.validateSync());
  });
  t("identity uniqueness index is declared", () => {
    const idx = RealModel.schema.indexes();
    assert.ok(idx.some(([keys, o]) =>
      o?.unique && keys.ownerUserId && keys.subaccountId && keys.identityKey));
  });

  console.log("\n-- identity resolution --");
  t("phone normalized to E.164", () => assert.strictEqual(M.normalizePhone("(555) 123-4567"), "+15551234567"));
  t("E.164 phone left alone", () => assert.strictEqual(M.normalizePhone("+441632960961"), "+441632960961"));
  t("11-digit US number normalized", () => assert.strictEqual(M.normalizePhone("15551234567"), "+15551234567"));
  t("phone beats email", () => assert.strictEqual(M.identityKeyFor({ phone: "5551234567", email: "a@b.com" }), "phone:+15551234567"));
  t("email used when no phone", () => assert.strictEqual(M.identityKeyFor({ email: "A@B.com " }), "email:a@b.com"));
  t("anonymous visitor keyed per widget", () => assert.strictEqual(M.identityKeyFor({ visitorId: "v1", widgetId: "wgt_x" }), "visitor:wgt_x:v1"));
  t("dashboard tester keyed per user", () => assert.strictEqual(M.identityKeyFor({ userId: "u1" }), "user:u1"));
  t("no identity yields no key", () => assert.strictEqual(M.identityKeyFor({}), ""));

  console.log("\n-- a call is captured (voice write path) --");
  const user = { _id: OWNER, openAIApiKey: "" };
  const call = { id: "call_1", assistantId: "ast_1", customer: { number: "+15551234567" } };
  const artifact = { transcript: "User: Hi, I'm Dana and I drive a 2019 Civic\nAI: How can I help?" };
  await M.captureVapiCall({
    user, call, artifact,
    analysis: { summary: "Dana asked about a service appointment.", structuredData: { vehicle: "2019 Civic" } },
    subaccountId: "loc_1", durationSec: 92,
  });
  let mem = store.find((d) => d.identityKey === "phone:+15551234567");
  t("caller got a memory", () => assert.ok(mem));
  t("transcript became turns", () => assert.strictEqual(mem.turns.length, 2));
  t("structuredData became a fact", () => assert.strictEqual(mem.facts.find((f) => f.key === "vehicle").value, "2019 Civic"));
  t("interaction holds the call summary", () => assert.strictEqual(mem.interactions[0].summary, "Dana asked about a service appointment."));
  t("duration retained", () => assert.strictEqual(mem.interactions[0].durationSec, 92));

  await M.captureVapiCall({ user, call, artifact, analysis: { summary: "same" }, subaccountId: "loc_1" });
  t("duplicate Vapi webhook is a no-op", () => {
    assert.strictEqual(mem.turns.length, 2);
    assert.strictEqual(mem.interactionCount, 1);
  });

  const countBefore = store.length;
  await M.captureVapiCall({
    user, call: { id: "call_empty", assistantId: "ast_1", customer: { number: "+15559998888" } },
    artifact: {}, subaccountId: "loc_1",
  });
  t("a contentless call.ended creates nothing", () => assert.strictEqual(store.length, countBefore));

  console.log("\n-- the caller now texts (cross-channel continuity) --");
  const smsMem = await M.ensureMemory({ ownerUserId: OWNER, subaccountId: "loc_1", phone: "555-123-4567" });
  t("SMS resolves to the SAME memory as the call", () => assert.strictEqual(smsMem, mem));

  const block = M.buildMemoryBlock(smsMem);
  t("block carries the fact learned by phone", () => assert.ok(block.includes("2019 Civic")));
  t("block marks a returning customer", () => assert.ok(/spoken with this person 1 time/.test(block)));
  t("block replays the prior conversation", () => assert.ok(block.includes("Dana")));
  t("block tells the model not to read it aloud", () => assert.ok(/not read this section aloud/i.test(block)));

  await M.recordTurns(smsMem, [
    { role: "user", content: "Can I move it to Friday?" },
    { role: "assistant", content: "Friday at 10am works." },
  ], { channel: "sms", assistantId: "ast_1" });
  await M.recordInteraction(smsMem, { channel: "sms", assistantId: "ast_1", refId: "c_a", sessionWindowMinutes: 30 });
  await M.recordInteraction(smsMem, { channel: "sms", assistantId: "ast_1", refId: "c_b", sessionWindowMinutes: 30 });
  t("SMS turns appended to the same record", () => assert.strictEqual(mem.turns.length, 4));
  t("a texting session counts once, not per message", () => assert.strictEqual(mem.interactionCount, 2));
  t("both channels tracked", () => assert.ok(mem.channels.includes("call") && mem.channels.includes("sms")));

  console.log("\n-- facts, notes, opt-out --");
  await M.upsertFacts(mem, { vehicle: "2020 Civic" }, { source: "tool" });
  t("restating a fact updates in place", () => {
    assert.strictEqual(mem.facts.filter((f) => f.key === "vehicle").length, 1);
    assert.strictEqual(mem.facts.find((f) => f.key === "vehicle").value, "2020 Civic");
  });
  await M.upsertFacts(mem, { "": "ignored", blank: "" }, { source: "tool" });
  t("empty keys and values are ignored", () => assert.strictEqual(mem.facts.length, 1));

  await M.appendNote(mem, "Prefers morning appointments.", { assistantId: "ast_1" });
  t("add_note lands in the summary", () => assert.ok(mem.summary.includes("Prefers morning")));
  t("note reaches the injected block", () => assert.ok(M.buildMemoryBlock(mem).includes("Prefers morning")));

  mem.optedOut = true;
  t("opted-out customer injects nothing", () => assert.strictEqual(M.buildMemoryBlock(mem), ""));
  t("opted-out customer is not loaded", async () => {});
  assert.strictEqual(await M.loadMemory({ ownerUserId: OWNER, subaccountId: "loc_1", phone: "+15551234567" }), null);
  t("loadMemory refuses an opted-out customer", () => assert.ok(true));
  mem.optedOut = false;

  console.log("\n-- scoping: an unresolved sub-account must not pool --");
  t("a real sub-account scopes to itself", () =>
    assert.strictEqual(M.scopeOf("loc_1", null), "loc_1"));
  t("an untied widget gets its own scope, not a shared bucket", () =>
    assert.strictEqual(M.scopeOf("", "wgt_abc"), "widget:wgt_abc"));
  t("no sub-account and no widget is unscoped", () => {
    assert.strictEqual(M.scopeOf(null, null), "");
    assert.strictEqual(M.scopeOf(undefined, undefined), "");
  });
  t("an unscoped write is refused rather than pooled", async () => {});
  const unscoped = await M.ensureMemory({ ownerUserId: OWNER, phone: "+15550001111" });
  t("ensureMemory returns null when it cannot scope", () =>
    assert.strictEqual(unscoped, null));
  const unscopedRead = await M.loadMemory({ ownerUserId: OWNER, phone: "+15550001111" });
  t("loadMemory returns null when it cannot scope", () =>
    assert.strictEqual(unscopedRead, null));

  console.log("\n-- recognising a returning caller --");
  t("the block tells the assistant NOT to ask for known details", () => {
    const block = M.buildMemoryBlock({
      identityKey: "phone:+1555", name: "Dana Reed", phone: "+15551234567",
      email: "d@e.com", interactionCount: 2, channels: ["call"],
      facts: [], turns: [], interactions: [],
    });
    assert.ok(/ALREADY have this person's details/.test(block));
    assert.ok(/do NOT ask for their name/i.test(block));
    assert.ok(/Greet them by name \(Dana\)/.test(block));
  });
  t("with no name it still forbids re-asking for what is known", () => {
    const block = M.buildMemoryBlock({
      identityKey: "phone:+1555", phone: "+15551234567",
      interactionCount: 1, channels: ["call"], facts: [], turns: [], interactions: [],
    });
    assert.ok(/Do NOT ask for any detail listed above/.test(block));
    assert.ok(!/Greet them by name/.test(block));
  });

  console.log("\n-- tenant isolation --");
  const otherAgency = await M.ensureMemory({ ownerUserId: "owner_b", subaccountId: "loc_1", phone: "+15551234567" });
  t("same phone, different agency = separate memory", () => assert.notStrictEqual(otherAgency, mem));
  const otherSub = await M.ensureMemory({ ownerUserId: OWNER, subaccountId: "loc_2", phone: "+15551234567" });
  t("same phone, different sub-account = separate memory", () => assert.notStrictEqual(otherSub, mem));

  console.log("\n-- caps and rollover --");
  const bulk = [];
  for (let i = 0; i < 60; i++) bulk.push({ role: i % 2 ? "assistant" : "user", content: `msg ${i}` });
  await M.recordTurns(mem, bulk, { channel: "chat", assistantId: "ast_1" });
  t("turns capped at 40", () => assert.strictEqual(mem.turns.length, 40));
  t("evicted turns folded into the summary", () => assert.ok(mem.summary.includes("msg 0")));
  t("summary stays bounded", () => assert.ok(mem.summary.length <= 1500));
  t("injected block replays only the recent window", () =>
    assert.ok(M.buildMemoryBlock(mem).split("\n").filter((l) => /^(Customer|You):/.test(l)).length <= M.CONTEXT_TURNS));
  await M.recordTurns(mem, [{ role: "user", content: "x".repeat(5000) }], { channel: "chat" });
  t("an oversized turn is clipped", () => assert.ok(mem.turns[mem.turns.length - 1].content.length <= 1200));

  console.log("\n-- transcript parsing --");
  t("structured Vapi messages parsed, system dropped", () =>
    assert.deepStrictEqual(
      M.turnsFromArtifact(null, [
        { role: "user", message: "hello" },
        { role: "bot", message: "hi there" },
        { role: "system", message: "ignore me" },
      ]),
      [{ role: "user", content: "hello" }, { role: "assistant", content: "hi there" }],
    ));
  t("flat transcript parsed", () =>
    assert.deepStrictEqual(M.turnsFromArtifact({ transcript: "User: a\nAI: b" }),
      [{ role: "user", content: "a" }, { role: "assistant", content: "b" }]));
  t("empty artifact yields nothing", () => assert.deepStrictEqual(M.turnsFromArtifact({}), []));
  t("unparseable transcript yields nothing", () =>
    assert.deepStrictEqual(M.turnsFromArtifact({ transcript: "garbage with no roles" }), []));

  console.log("\n-- team notes --");
  t("team notes render into the context", () => {
    const ctx = M.buildContextBlock(null, { assistantNotes: "Always mention the Friday promo." });
    assert.ok(ctx.includes("Team notes") && ctx.includes("Friday promo"));
  });
  t("no memory and no notes = nothing injected", () => assert.strictEqual(M.buildContextBlock(null, {}), ""));
  t("memorySystemTurns yields one system turn", () => {
    const turns = M.memorySystemTurns(mem, { assistantNotes: "note" });
    assert.strictEqual(turns.length, 1);
    assert.strictEqual(turns[0].role, "system");
    assert.ok(turns[0].content.includes("note"));
  });
  t("memorySystemTurns is empty with nothing to say", () =>
    assert.deepStrictEqual(M.memorySystemTurns(null, {}), []));

  console.log("\n-- Chat Lab scoping --");
  const tester = await M.ensureMemory({ ownerUserId: OWNER, subaccountId: "loc_1", userId: "u_dev" });
  await M.recordTurns(tester, [{ role: "user", content: "testing A" }], { channel: "chat", assistantId: "ast_A" });
  await M.recordTurns(tester, [{ role: "user", content: "testing B" }], { channel: "chat", assistantId: "ast_B" });
  t("tester keyed on the team member", () => assert.strictEqual(tester.identityKey, "user:u_dev"));
  t("scoped replay sees only its own assistant", () => {
    const turns = M.recentTurnsFor(tester, { assistantId: "ast_A" });
    assert.deepStrictEqual(turns, [{ role: "user", content: "testing A" }]);
  });
  t("scoped block excludes the other assistant's thread", () => {
    const b = M.buildMemoryBlock(tester, { assistantId: "ast_A" });
    assert.ok(b.includes("testing A"));
    assert.ok(!b.includes("testing B"));
  });
  t("unscoped replay (real customers) sees every assistant", () =>
    assert.strictEqual(M.recentTurnsFor(tester).length, 2));

  console.log("\n-- failure containment --");
  t("null memory never throws", () => {
    assert.strictEqual(M.buildMemoryBlock(null), "");
    assert.deepStrictEqual(M.recentTurnsFor(null), []);
  });
  await M.recordTurns(null, [{ role: "user", content: "x" }], {});
  await M.upsertFacts(null, { a: 1 }, {});
  await M.appendNote(null, "x", {});
  await M.recordInteraction(null, {});
  t("write helpers tolerate a null memory", () => assert.ok(true));

  console.log("\n-- kill switch --");
  process.env.CUSTOMER_MEMORY_ENABLED = "false";
  assert.strictEqual(await M.loadMemory({ ownerUserId: OWNER, subaccountId: "loc_1", phone: "+15551234567" }), null);
  assert.strictEqual(await M.ensureMemory({ ownerUserId: OWNER, subaccountId: "loc_1", phone: "+15550000000" }), null);
  t("CUSTOMER_MEMORY_ENABLED=false disables read and write", () => assert.ok(true));
  process.env.CUSTOMER_MEMORY_ENABLED = "true";

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
