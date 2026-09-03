// Shared readiness audit for an assistant (the Vapi assistant object held in
// state.assistants.selectedAssistant). Returns a list of checks so the
// Experiments dropdown, the header "Issues" count, and the Issues modal all
// stay in sync.
//
// Each check: { id, label, status: "pass" | "warn", detail }

// `calendar` is the result of the connected-calendar check, when one has been
// run: { calendarLinked, calendarMissing, reconnectRequired }. It is optional —
// the audit still works without it, it just cannot report on booking.
export const auditAssistant = (assistant, calendar) => {
  const model = assistant?.model || {};
  const voice = assistant?.voice || {};

  // System prompt can live on model.systemPrompt or in a system message
  const systemPrompt =
    model.systemPrompt ||
    (Array.isArray(model.messages)
      ? model.messages.find((m) => m.role === "system")?.content
      : "") ||
    "";

  const toolCount = Array.isArray(model.toolIds) ? model.toolIds.length : 0;

  const checks = [
    {
      id: "prompt",
      label: "System prompt",
      status: systemPrompt.trim().length >= 20 ? "pass" : "warn",
      detail:
        systemPrompt.trim().length >= 20
          ? "A system prompt is configured."
          : "Add a system prompt so the assistant knows how to behave.",
    },
    {
      id: "model",
      label: "AI model",
      status: model.model ? "pass" : "warn",
      detail: model.model ? `Using ${model.model}.` : "No AI model selected.",
    },
    {
      id: "voice",
      label: "Voice",
      status: voice.voiceId ? "pass" : "warn",
      detail: voice.voiceId
        ? `Voice set (${voice.voiceId}).`
        : "No voice selected — pick one from the Voice Library.",
    },
    {
      id: "greeting",
      label: "First message",
      status: assistant?.firstMessage ? "pass" : "warn",
      detail: assistant?.firstMessage
        ? "A greeting is set."
        : "Add a first message so the assistant opens the conversation.",
    },
    {
      id: "tools",
      label: "Tools",
      status: toolCount > 0 ? "pass" : "warn",
      detail:
        toolCount > 0
          ? `${toolCount} tool${toolCount > 1 ? "s" : ""} attached.`
          : "No tools attached — add some from the Toolkit (optional).",
    },
  ];

  // Booking. Nothing used to check this, so a calendar that had been deleted or
  // unshared in GoHighLevel stayed silently broken until a caller asked for an
  // appointment and the assistant could not answer.
  if (calendar) {
    const bookingCheck = calendar.reconnectRequired
      ? {
          status: "warn",
          detail:
            "This sub-account's GoHighLevel connection has expired, so booking and availability will fail. Reconnect it.",
        }
      : calendar.calendarMissing
        ? {
            status: "warn",
            detail:
              "The linked calendar no longer exists in GoHighLevel — it may have been deleted or unshared. Pick a calendar again.",
          }
        : calendar.calendarLinked === false
          ? {
              status: "warn",
              detail:
                "No calendar is linked, so this assistant cannot check availability or book appointments.",
            }
          : { status: "pass", detail: "A GoHighLevel calendar is linked and reachable." };

    checks.push({ id: "calendar", label: "Booking calendar", ...bookingCheck });
  }

  const issues = checks.filter((c) => c.status === "warn");
  return { checks, issues, issueCount: issues.length };
};
