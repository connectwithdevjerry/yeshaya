// What reaches Vapi on a call.
//
// This used to build a model override from a live GET /assistant/{id}. Both
// halves were wrong on this runtime: the read happened on every single call
// (the cache in front of it was a module-level Map, and each invocation is a
// fresh process), and the override replaced the assistant's model, so one Vapi
// accepted but could not run left the assistant answering, saying nothing, and
// hanging up.
//
// So the rule these tests hold: nothing on the call path talks to Vapi, and
// nothing replaces the assistant's own configuration.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

const AXIOS = require.resolve("axios");
const calls = { get: [], post: [] };
let postHandler = async () => ({ data: {} });
require.cache[AXIOS] = {
  id: AXIOS, filename: AXIOS, loaded: true,
  exports: {
    async get(url, cfg) { calls.get.push({ url, cfg }); return { data: {} }; },
    async post(url, body, cfg) { calls.post.push({ url, body, cfg }); return postHandler(url, body, cfg); },
  },
};
const MODEL = require.resolve("../model/customerMemory.model");
require.cache[MODEL] = { id: MODEL, filename: MODEL, loaded: true, exports: {} };

const M = require("../helpers/customerMemory");

const memory = {
  name: "Dana", phone: "+15551234567", email: "", summary: "Wants a Friday slot.",
  facts: [{ key: "vehicle", value: "2019 Civic" }], turns: [], interactions: [],
  channels: ["call"], interactionCount: 2, optedOut: false,
};

(async () => {
  console.log("\n-- the call path never talks to Vapi --");
  calls.get.length = 0;
  let ov = await M.buildAssistantOverrides({
    assistantId: "ast_1", memory, timezone: "America/New_York",
    caller: { number: "+15551234567" },
    base: { firstMessage: "Hi!", firstMessageMode: "assistant-speaks-first" },
  });
  t("the assistant is never read back", () => assert.strictEqual(calls.get.length, 0));
  t("no model override is sent, so nothing can replace the model", () =>
    assert.strictEqual(ov.model, undefined));
  t("the base overrides are passed through untouched", () => {
    assert.strictEqual(ov.firstMessage, "Hi!");
    assert.strictEqual(ov.firstMessageMode, "assistant-speaks-first");
  });

  console.log("\n-- the context rides on variable values instead --");
  t("the whole block is available as {{memory}}", () => {
    assert.ok(ov.variableValues.memory.includes("2019 Civic"));
    assert.ok(ov.variableValues.memory.includes("+15551234567"));
    assert.ok(ov.variableValues.memory.includes("## Today"));
  });
  t("and the useful parts individually", () => {
    assert.strictEqual(ov.variableValues.customerPhone, "+15551234567");
    assert.strictEqual(ov.variableValues.customerName, "Dana");
    assert.strictEqual(ov.variableValues.isReturningCustomer, "true");
    assert.strictEqual(ov.variableValues.currentTimezone, "America/New_York");
    assert.match(ov.variableValues.currentDate, /^\d{4}-\d{2}-\d{2}$/);
  });
  const fresh = await M.buildAssistantOverrides({
    assistantId: "ast_2", memory: null, caller: { number: "+15559999999" }, base: {},
  });
  t("a first-time caller still gets the date and their number", () => {
    assert.ok(fresh.variableValues.memory.includes("## Today"));
    assert.strictEqual(fresh.variableValues.customerPhone, "+15559999999");
    assert.strictEqual(fresh.variableValues.isReturningCustomer, "false");
  });

  const withNotes = await M.buildAssistantOverrides({
    assistantId: "ast_1", memory, assistantNotes: "Mention the Friday promo.", base: {},
  });
  t("team notes reach the block too", () =>
    assert.ok(withNotes.variableValues.memory.includes("Friday promo")));

  console.log("\n-- the marker is added where prompts are written --");
  t("a prompt without it gains it", () => {
    const out = M.withPromptContext("You are Ada.");
    assert.ok(out.startsWith("You are Ada."));
    assert.ok(out.includes(M.PROMPT_CONTEXT_MARKER));
  });
  t("a prompt that has it is left exactly alone", () => {
    const once = M.withPromptContext("You are Ada.");
    assert.strictEqual(M.withPromptContext(once), once);
    // Including one an agency placed themselves, anywhere in the prompt.
    const custom = "Start.\n{{memory}}\nEnd.";
    assert.strictEqual(M.withPromptContext(custom), custom);
  });
  t("a missing or non-string prompt does not throw", () => {
    for (const bad of [undefined, null, 42, {}]) {
      assert.ok(M.withPromptContext(bad).includes(M.PROMPT_CONTEXT_MARKER));
    }
  });

  console.log("\n-- carrying context never costs a call --");
  let attempt = 0;
  postHandler = async (url, body) => {
    attempt++;
    if (attempt === 1) throw Object.assign(new Error("bad variables"), {
      response: { status: 400, data: { message: "variableValues invalid" } },
    });
    return { data: { id: "call_ok", body } };
  };
  calls.post.length = 0;
  const res = await M.postVapiCall({
    assistantId: "a",
    assistantOverrides: { firstMessage: "Hi", variableValues: { memory: "…" } },
  });
  t("a rejected variable set is dropped and the call still connects", () => {
    assert.strictEqual(res.data.id, "call_ok");
    assert.strictEqual(calls.post.length, 2);
    assert.strictEqual(calls.post[1].body.assistantOverrides.variableValues, undefined);
    assert.strictEqual(calls.post[1].body.assistantOverrides.firstMessage, "Hi");
  });

  postHandler = async () => { throw Object.assign(new Error("no funds"), { response: { status: 402 } }); };
  let threw = false;
  try {
    await M.postVapiCall({ assistantId: "a", assistantOverrides: { variableValues: {} } });
  } catch { threw = true; }
  t("a real failure is not swallowed", () => assert.ok(threw));

  console.log("\n-- postVapiChat retries without the system turn --");
  postHandler = async (url, body) => {
    if (body.input.some((m) => m.role === "system")) {
      throw Object.assign(new Error("role"), {
        response: { status: 400, data: { message: "system role not allowed" } },
      });
    }
    return { data: { id: "chat_ok" } };
  };
  calls.post.length = 0;
  const chat = await M.postVapiChat({
    assistantId: "a",
    input: [{ role: "system", content: "memory" }, { role: "user", content: "hello" }],
  });
  t("the chat still answers", () => assert.strictEqual(chat.data.id, "chat_ok"));
  t("the user's message survives", () =>
    assert.deepStrictEqual(calls.post[1].body.input, [{ role: "user", content: "hello" }]));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
