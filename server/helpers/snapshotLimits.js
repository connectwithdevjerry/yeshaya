// Enforce the agency's snapshot "Limits" per sub-account.
// Each limit: { enabled: bool, value: string }. 0/blank = unlimited.

const num = (v) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : n; };

const countAssistants = (sub) => (sub.vapiAssistants || []).length;

const countPhones = (sub) =>
  (sub.vapiAssistants || []).reduce((a, ast) => a + (ast.numberDetails?.length || 0), 0) +
  (sub.byoNumbers?.length || 0);

// type: "assistants" | "phones"  → { exceeded, limit, count }
const checkSnapshotLimit = (user, sub, type) => {
  const lim = user?.snapshot?.limits?.[type];
  if (!lim || !lim.enabled) return { exceeded: false };
  const limit = num(lim.value);
  if (limit <= 0) return { exceeded: false }; // unlimited

  let count = 0;
  if (type === "assistants") count = countAssistants(sub);
  else if (type === "phones") count = countPhones(sub);

  return { exceeded: count >= limit, limit, count };
};

// ─── Usage-based caps (per sub-account, per calendar month) ──────────────────
// "calling" = total call minutes; "messages" = total chat messages.
// Usage is summed from the agency's recorded billingEvents (which now carry a
// subaccountId + durationSec), the same approach used for per-number budgets.

const CHARGE_TYPES = ["end-of-call-report", "call.ended", "call.analysis.completed"];

// Find which sub-account owns a given Vapi assistant
const resolveSubaccountId = (user, assistantId) => {
  for (const sub of user?.ghlSubAccountIds || []) {
    if ((sub.vapiAssistants || []).some((a) => a.assistantId === assistantId)) {
      return sub.accountId;
    }
  }
  return null;
};

// Sum this sub-account's usage for the current month.
//
// Delegates to the billing helper, which reads the billingEvent collection and
// merges in any history still embedded on the user document. Async because the
// events no longer live on the document already in memory.
const usageThisMonth = (user, subaccountId) =>
  require("./billing").usageThisMonth(user, subaccountId);

// kind: "calling" (minutes) | "messages" → reason string if exceeded, else null
const checkUsageLimit = async (user, subaccountId, kind) => {
  if (!subaccountId) return null;
  const lim = user?.snapshot?.limits?.[kind];
  if (!lim || !lim.enabled) return null;
  const cap = num(lim.value);
  if (cap <= 0) return null; // unlimited

  const usage = await usageThisMonth(user, subaccountId);
  if (kind === "calling" && usage.minutes >= cap) {
    return `Monthly call-minute limit reached (${cap} min) for this sub-account.`;
  }
  if (kind === "messages" && usage.messages >= cap) {
    return `Monthly message limit reached (${cap}) for this sub-account.`;
  }
  return null;
};

// ─── Feature gating ──────────────────────────────────────────────────────────
// Agency-level capability toggles (voice | chat | kb | phones). A capability is
// blocked ONLY when explicitly turned off (=== false). Unset/undefined stays
// enabled, so turning enforcement on never silently breaks existing accounts.
const featureEnabled = (user, key) => user?.snapshot?.features?.[key] !== false;

const FEATURE_LABELS = {
  voice:  "Voice calling",
  chat:   "Chat",
  kb:     "Knowledge base",
  phones: "Phone numbers",
};

// Returns a reason string if the feature is disabled, else null.
const checkFeature = (user, key) =>
  featureEnabled(user, key)
    ? null
    : `${FEATURE_LABELS[key] || key} is disabled for this agency in Agency → Snapshot → Features.`;

module.exports = {
  checkSnapshotLimit,
  resolveSubaccountId,
  usageThisMonth,
  checkUsageLimit,
  featureEnabled,
  checkFeature,
};
