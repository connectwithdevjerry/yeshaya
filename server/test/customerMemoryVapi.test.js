// Verifies the Vapi interaction: prompt injection preserves the assistant's own
// config, and a rejected override degrades instead of failing the call.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

// Stub axios before the helper loads.
const AXIOS = require.resolve("axios");
const calls = { get: [], post: [] };
let getHandler = async () => ({ data: {} });
let postHandler = async () => ({ data: {} });
require.cache[AXIOS] = {
  id: AXIOS, filename: AXIOS, loaded: true,
  exports: {
    async get(url, cfg) { calls.get.push({ url, cfg }); return getHandler(url, cfg); },
    async post(url, body, cfg) { calls.post.push({ url, body, cfg }); return postHandler(url, body, cfg); },
  },
};
// Stub the model too — not exercised here.
const MODEL = require.resolve("../model/customerMemory.model");
require.cache[MODEL] = { id: MODEL, filename: MODEL, loaded: true, exports: {} };

const M = require("../helpers/customerMemory");

const memory = {
  name: "Dana", phone: "+15551234567", email: "", summary: "Wants a Friday slot.",
  facts: [{ key: "vehicle", value: "2019 Civic" }], turns: [], interactions: [],
  channels: ["call"], interactionCount: 2, optedOut: false,
};

(async () => {
  console.log("\n-- prompt injection preserves the assistant's config --");
  getHandler = async () => ({
    data: {
      model: {
        provider: "openai", model: "gpt-4o", temperature: 0.3,
        toolIds: ["tool_1"],
        messages: [{ role: "system", content: "You are Ada, a receptionist." }],
      },
    },
  });
  let ov = await M.buildAssistantOverrides({
    assistantId: "ast_1", memory, base: { firstMessage: "Hi!", firstMessageMode: "assistant-speaks-first" },
  });
  t("base overrides preserved", () => {
    assert.strictEqual(ov.firstMessage, "Hi!");
    assert.strictEqual(ov.firstMessageMode, "assistant-speaks-first");
  });
  t("original system prompt kept", () => assert.ok(ov.model.messages[0].content.startsWith("You are Ada")));
  t("memory appended to it, not replacing it", () => assert.ok(ov.model.messages[0].content.includes("2019 Civic")));
  t("model provider/temperature/tools untouched", () => {
    assert.strictEqual(ov.model.provider, "openai");
    assert.strictEqual(ov.model.temperature, 0.3);
    assert.deepStrictEqual(ov.model.toolIds, ["tool_1"]);
  });
  t("{{memory}} variable also provided", () => assert.ok(ov.variableValues.memory.includes("2019 Civic")));
  t("returning-customer flag exposed to templates", () =>
    assert.strictEqual(ov.variableValues.isReturningCustomer, "true"));

  console.log("\n-- assistant with no system message --");
  getHandler = async () => ({ data: { model: { provider: "openai", model: "gpt-4o", messages: [] } } });
  ov = await M.buildAssistantOverrides({ assistantId: "ast_1", memory, base: {} });
  t("a system message is created", () => {
    assert.strictEqual(ov.model.messages[0].role, "system");
    assert.ok(ov.model.messages[0].content.includes("Customer memory"));
  });

  console.log("\n-- team notes ride along --");
  getHandler = async () => ({ data: { model: { provider: "openai", model: "gpt-4o", messages: [{ role: "system", content: "Base." }] } } });
  ov = await M.buildAssistantOverrides({ assistantId: "ast_1", memory, assistantNotes: "Mention the Friday promo.", base: {} });
  t("notes and memory both injected", () => {
    assert.ok(ov.model.messages[0].content.includes("Friday promo"));
    assert.ok(ov.model.messages[0].content.includes("2019 Civic"));
  });

  console.log("\n-- degradation --");
  // A cold assistant id: nothing cached, so a failed read must degrade.
  getHandler = async () => { throw Object.assign(new Error("boom"), { response: { status: 500 } }); };
  ov = await M.buildAssistantOverrides({ assistantId: "ast_cold", memory, base: { firstMessage: "Hi!" } });
  t("unreadable assistant does not throw", () => assert.strictEqual(ov.firstMessage, "Hi!"));
  t("no model override when the read failed and nothing is cached", () =>
    assert.strictEqual(ov.model, undefined));
  t("{{memory}} still available as a fallback", () => assert.ok(ov.variableValues.memory));

  // ast_1 was read successfully earlier, so its config is cached. A transient
  // Vapi failure should not cost the caller their memory injection.
  ov = await M.buildAssistantOverrides({ assistantId: "ast_1", memory, base: {} });
  t("a cached config survives a transient Vapi failure", () => assert.ok(ov.model));
  t("and still carries the memory", () =>
    assert.ok(ov.model.messages[0].content.includes("2019 Civic")));

  console.log("\n-- the read is cached, not repeated per call --");
  calls.get.length = 0;
  let served = 0;
  getHandler = async () => {
    served += 1;
    return { data: { model: { provider: "openai", model: "gpt-4o", messages: [{ role: "system", content: "Base." }] } } };
  };
  await M.buildAssistantOverrides({ assistantId: "ast_fresh", memory, base: {} });
  await M.buildAssistantOverrides({ assistantId: "ast_fresh", memory, base: {} });
  await M.buildAssistantOverrides({ assistantId: "ast_fresh", memory, base: {} });
  t("three calls to one assistant hit Vapi once, not three times", () =>
    assert.strictEqual(served, 1));

  ov = await M.buildAssistantOverrides({ assistantId: "ast_1", memory: null, base: { firstMessage: "Hi!" } });
  t("no memory = base returned untouched, no Vapi read", () =>
    assert.deepStrictEqual(ov, { firstMessage: "Hi!" }));

  console.log("\n-- postVapiCall retries without the model override --");
  let attempt = 0;
  postHandler = async (url, body) => {
    attempt++;
    if (attempt === 1) throw Object.assign(new Error("bad model"), {
      response: { status: 400, data: { message: "model override invalid" } },
    });
    return { data: { id: "call_ok", body } };
  };
  calls.post.length = 0;
  let res = await M.postVapiCall({
    assistantId: "a", assistantOverrides: { firstMessage: "Hi", model: { provider: "openai" } },
  });
  t("the call still goes through", () => assert.strictEqual(res.data.id, "call_ok"));
  t("exactly one retry", () => assert.strictEqual(calls.post.length, 2));
  t("retry dropped the model override", () =>
    assert.strictEqual(calls.post[1].body.assistantOverrides.model, undefined));
  t("retry kept the rest of the overrides", () =>
    assert.strictEqual(calls.post[1].body.assistantOverrides.firstMessage, "Hi"));

  console.log("\n-- a real error is not swallowed --");
  postHandler = async () => { throw Object.assign(new Error("no funds"), { response: { status: 402 } }); };
  let threw = false;
  try { await M.postVapiCall({ assistantId: "a", assistantOverrides: { model: {} } }); }
  catch (e) { threw = true; }
  t("non-400 errors propagate", () => assert.ok(threw));

  postHandler = async () => { throw Object.assign(new Error("bad assistant"), { response: { status: 400 } }); };
  threw = false;
  try { await M.postVapiCall({ assistantId: "a", assistantOverrides: { firstMessage: "x" } }); }
  catch (e) { threw = true; }
  t("400 with no model override is not retried", () => assert.ok(threw));

  console.log("\n-- postVapiChat retries without the system turn --");
  attempt = 0;
  postHandler = async (url, body) => {
    attempt++;
    if (attempt === 1) throw Object.assign(new Error("role"), {
      response: { status: 400, data: { message: "system role not allowed" } },
    });
    return { data: { id: "chat_ok", output: [{ role: "assistant", content: "hi" }] } };
  };
  calls.post.length = 0;
  res = await M.postVapiChat({
    assistantId: "a",
    input: [{ role: "system", content: "memory" }, { role: "user", content: "hello" }],
  });
  t("the chat still answers", () => assert.strictEqual(res.data.id, "chat_ok"));
  t("retry dropped the system turn", () =>
    assert.deepStrictEqual(calls.post[1].body.input, [{ role: "user", content: "hello" }]));
  t("the user's message survived", () => assert.strictEqual(calls.post[1].body.input[0].content, "hello"));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
