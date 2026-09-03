// E.164 normalisation for caller numbers.
//
// Vapi rejects a call with HTTP 400 — "customer.number must be a valid phone
// number in the E.164 format" — if the number is even slightly off, and the
// caller just hears the call fail. Twilio does not always send E.164.
const assert = require("assert");
const { toE164, isE164 } = require("../helperFunctions");

let pass = 0, fail = 0;
const t = (name, fn) => {
  try { fn(); console.log(`  ok   ${name}`); pass++; }
  catch (e) { console.log(`  FAIL ${name}\n       ${e.message}`); fail++; }
};

console.log("\n-- shapes Twilio actually sends --");
t("E.164 passes through untouched", () =>
  assert.strictEqual(toE164("+15551234567"), "+15551234567"));
t("a SIP URI is unwrapped", () =>
  assert.strictEqual(toE164("sip:+15551234567@carrier.com"), "+15551234567"));
t("a tel: URI is unwrapped", () =>
  assert.strictEqual(toE164("tel:+442071838750"), "+442071838750"));
t("an international number keeps its country code", () =>
  assert.strictEqual(toE164("+44 20 7183 8750"), "+442071838750"));

console.log("\n-- shapes a human types --");
t("US formatting is normalised", () =>
  assert.strictEqual(toE164("(555) 123-4567"), "+15551234567"));
t("spaces and dashes are stripped", () =>
  assert.strictEqual(toE164("+1 555-123-4567"), "+15551234567"));
t("a bare 10-digit US number gains +1", () =>
  assert.strictEqual(toE164("5551234567"), "+15551234567"));
t("11 digits starting with 1 gains +", () =>
  assert.strictEqual(toE164("15551234567"), "+15551234567"));

console.log("\n-- unusable, and must NOT reach Vapi --");
for (const bad of ["anonymous", "unknown", "restricted", "client:jane", "", null, undefined, "abc"]) {
  t(`${JSON.stringify(bad)} yields empty`, () => assert.strictEqual(toE164(bad), ""));
}
t("a leading zero is not valid E.164", () =>
  assert.strictEqual(toE164("+0123456789"), ""));
t("more than 15 digits is not valid E.164", () =>
  assert.strictEqual(toE164("+1234567890123456"), ""));

console.log("\n-- the validator --");
t("accepts E.164", () => assert.ok(isE164("+15551234567")));
t("rejects a missing +", () => assert.ok(!isE164("15551234567")));
t("rejects a leading zero", () => assert.ok(!isE164("+0155512345")));
t("rejects empty", () => assert.ok(!isE164("")));

console.log("\n-- one identity across channels --");
t("a call and a text from the same person normalise identically", () =>
  assert.strictEqual(toE164("+1 (555) 123-4567"), toE164("sip:+15551234567@x.com")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
