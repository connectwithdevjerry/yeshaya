// The Vapi tool-call payload adapters.
//
// Every one of these was an unchecked assumption in the webhook, and each
// failed silently: a tool that cannot read its arguments returns nothing
// useful, and the caller hears the assistant stall or improvise.
const assert = require("assert");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

const { parseToolArgs, resolveAssistantId, toolCallsFrom } = require("../controller/assistant.controller");

console.log("\n-- tool arguments --");
t("JSON string is parsed (the OpenAI convention Vapi follows)", () =>
  assert.deepStrictEqual(
    parseToolArgs('{"startTime":"2026-09-10","customerEmail":"a@b.com"}'),
    { startTime: "2026-09-10", customerEmail: "a@b.com" },
  ));
t("an object passes through unchanged", () =>
  assert.deepStrictEqual(parseToolArgs({ startTime: "2026-09-10" }), { startTime: "2026-09-10" }));
t("the date actually survives — this is what booking needs", () =>
  assert.strictEqual(parseToolArgs('{"startTime":"2026-09-10"}').startTime, "2026-09-10"));
t("malformed JSON degrades to empty, never throws mid-call", () =>
  assert.deepStrictEqual(parseToolArgs("{not json"), {}));
t("missing arguments degrade to empty", () => {
  assert.deepStrictEqual(parseToolArgs(undefined), {});
  assert.deepStrictEqual(parseToolArgs(null), {});
  assert.deepStrictEqual(parseToolArgs(""), {});
});
t("nested values survive the parse", () =>
  assert.deepStrictEqual(
    parseToolArgs('{"customFields":{"vehicle":"Civic"}}').customFields,
    { vehicle: "Civic" },
  ));

console.log("\n-- assistant id --");
t("top-level assistantId", () =>
  assert.strictEqual(resolveAssistantId({ assistantId: "a1" }), "a1"));
t("nested under assistant", () =>
  assert.strictEqual(resolveAssistantId({ assistant: { id: "a2" } }), "a2"));
t("nested under call", () =>
  assert.strictEqual(resolveAssistantId({ call: { assistantId: "a3" } }), "a3"));
t("nested under call.assistant", () =>
  assert.strictEqual(resolveAssistantId({ call: { assistant: { id: "a4" } } }), "a4"));
t("absent yields empty, so the caller can answer instead of throwing", () =>
  assert.strictEqual(resolveAssistantId({}), ""));

console.log("\n-- tool call list --");
t("toolCalls", () => assert.strictEqual(toolCallsFrom({ toolCalls: [{ id: "1" }] }).length, 1));
t("toolCallList (older payloads)", () =>
  assert.strictEqual(toolCallsFrom({ toolCallList: [{ id: "1" }, { id: "2" }] }).length, 2));
t("neither present yields an empty list", () => assert.deepStrictEqual(toolCallsFrom({}), []));
t("a non-array is not trusted", () => assert.deepStrictEqual(toolCallsFrom({ toolCalls: "x" }), []));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
