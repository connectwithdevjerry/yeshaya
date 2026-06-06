const templateModel = require("../model/template.model");
const { fillTemplate } = require("../helperFunctions");

// ─── Extract {{variables}} from a prompt body ─────────────────────────────────
const extractVariables = (body = "", existing = []) => {
  const found = new Set();
  (body.match(/{{\s*([^}]+)\s*}}/g) || []).forEach((m) => {
    found.add(m.replace(/[{}]/g, "").trim());
  });
  const existingMap = {};
  (existing || []).forEach((v) => { existingMap[v.key] = v; });
  return [...found].map((key) => existingMap[key] || {
    key,
    label: key.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    defaultValue: "",
  });
};

// ─── Starter system templates (seeded once) ───────────────────────────────────
const SYSTEM_TEMPLATES = [
  {
    name: "Receptionist",
    category: "Receptionist",
    description: "Friendly front-desk assistant that greets callers and routes requests.",
    promptBody:
`You are the AI receptionist for {{businessName}}, a {{industry}} business.
Greet every caller warmly and professionally. Your goals:
- Answer common questions about {{businessName}} (hours: {{businessHours}}).
- Collect the caller's name, email, and reason for calling.
- If they want to book, offer to schedule an appointment.
Keep responses concise and friendly. Never invent information you don't have.`,
  },
  {
    name: "Lead Qualifier",
    category: "Sales",
    description: "Qualifies inbound leads against your criteria before booking a call.",
    promptBody:
`You are a sales qualification assistant for {{businessName}}.
Qualify the caller by asking about: their need for {{productOrService}}, budget, timeline, and decision-making role.
If they meet the criteria ({{qualificationCriteria}}), book a call with the sales team.
If not, politely collect their details for follow-up. Be consultative, not pushy.`,
  },
  {
    name: "Support Agent",
    category: "Support",
    description: "Handles customer support questions and escalates when needed.",
    promptBody:
`You are a customer support assistant for {{businessName}}.
Help callers resolve issues related to {{productOrService}}.
Use a calm, empathetic tone. Steps:
- Understand the problem clearly.
- Offer known solutions or workarounds.
- If unresolved, collect details and create a support ticket.
Always confirm the caller's contact info before ending the call.`,
  },
];

const seedSystemTemplates = async () => {
  const count = await templateModel.countDocuments({ isSystem: true });
  if (count > 0) return;
  await templateModel.insertMany(
    SYSTEM_TEMPLATES.map((t) => ({
      ...t,
      isSystem: true,
      userId: null,
      variables: extractVariables(t.promptBody),
    })),
  );
  console.log("🌱 Seeded system templates");
};

// ─── List templates (agency's own + system starters) ──────────────────────────
const getTemplates = async (req, res) => {
  try {
    const userId = req.user;
    await seedSystemTemplates();

    const templates = await templateModel
      .find({ $or: [{ userId }, { isSystem: true }] })
      .sort({ isSystem: -1, updatedAt: -1 })
      .select("-versions") // keep list light
      .lean();

    return res.status(200).json({ status: true, data: templates });
  } catch (err) {
    console.error("❌ getTemplates error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Get one (with versions) ──────────────────────────────────────────────────
const getTemplate = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const tpl = await templateModel.findOne({ _id: id, $or: [{ userId }, { isSystem: true }] }).lean();
    if (!tpl) return res.status(404).json({ status: false, message: "Template not found" });
    return res.status(200).json({ status: true, data: tpl });
  } catch (err) {
    console.error("❌ getTemplate error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Create ───────────────────────────────────────────────────────────────────
const createTemplate = async (req, res) => {
  try {
    const userId = req.user;
    const { name, description, category, promptBody, variables } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ status: false, message: "Name is required" });
    if (!promptBody || !promptBody.trim()) return res.status(400).json({ status: false, message: "Prompt body is required" });

    const tpl = await templateModel.create({
      userId,
      name: name.trim(),
      description: description || "",
      category: category || "Custom",
      promptBody,
      variables: extractVariables(promptBody, variables),
    });

    return res.status(200).json({ status: true, message: "Template created", data: tpl });
  } catch (err) {
    console.error("❌ createTemplate error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Update (snapshots previous body into versions) ───────────────────────────
const updateTemplate = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { name, description, category, promptBody, variables } = req.body;

    const tpl = await templateModel.findOne({ _id: id, userId });
    if (!tpl) return res.status(404).json({ status: false, message: "Template not found (system templates can't be edited)" });

    // Snapshot current version before overwriting (only if body changed)
    if (promptBody !== undefined && promptBody !== tpl.promptBody) {
      tpl.versions.push({ promptBody: tpl.promptBody, variables: tpl.variables, savedAt: new Date() });
      if (tpl.versions.length > 20) tpl.versions = tpl.versions.slice(-20); // cap history
    }

    if (name !== undefined)        tpl.name = name.trim() || tpl.name;
    if (description !== undefined) tpl.description = description;
    if (category !== undefined)    tpl.category = category;
    if (promptBody !== undefined) {
      tpl.promptBody = promptBody;
      tpl.variables = extractVariables(promptBody, variables ?? tpl.variables);
    }

    await tpl.save();
    return res.status(200).json({ status: true, message: "Template updated", data: tpl });
  } catch (err) {
    console.error("❌ updateTemplate error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Delete (system protected) ────────────────────────────────────────────────
const deleteTemplate = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const tpl = await templateModel.findOne({ _id: id, userId });
    if (!tpl) return res.status(404).json({ status: false, message: "Template not found (system templates can't be deleted)" });
    await templateModel.deleteOne({ _id: id });
    return res.status(200).json({ status: true, message: "Template deleted" });
  } catch (err) {
    console.error("❌ deleteTemplate error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Apply — fill variables and return the final prompt ───────────────────────
const applyTemplate = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const { values = {} } = req.body;

    const tpl = await templateModel.findOne({ _id: id, $or: [{ userId }, { isSystem: true }] });
    if (!tpl) return res.status(404).json({ status: false, message: "Template not found" });

    // Fill missing keys with defaults so it never throws
    const filledValues = {};
    (tpl.variables || []).forEach((v) => {
      filledValues[v.key] = values[v.key] ?? v.defaultValue ?? "";
    });

    const prompt = fillTemplate(tpl.promptBody, filledValues);
    return res.status(200).json({ status: true, data: { prompt } });
  } catch (err) {
    console.error("❌ applyTemplate error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Restore a previous version ───────────────────────────────────────────────
const restoreVersion = async (req, res) => {
  try {
    const userId = req.user;
    const { id, versionId } = req.params;
    const tpl = await templateModel.findOne({ _id: id, userId });
    if (!tpl) return res.status(404).json({ status: false, message: "Template not found" });

    const version = tpl.versions.id(versionId);
    if (!version) return res.status(404).json({ status: false, message: "Version not found" });

    // Snapshot current before restoring
    tpl.versions.push({ promptBody: tpl.promptBody, variables: tpl.variables, savedAt: new Date() });
    tpl.promptBody = version.promptBody;
    tpl.variables = extractVariables(version.promptBody, version.variables);
    await tpl.save();

    return res.status(200).json({ status: true, message: "Version restored", data: tpl });
  } catch (err) {
    console.error("❌ restoreVersion error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Save an existing prompt (e.g. from an assistant) as a template ───────────
const createFromPrompt = async (req, res) => {
  try {
    const userId = req.user;
    const { name, promptBody, category, description } = req.body;
    if (!name || !promptBody) return res.status(400).json({ status: false, message: "Name and prompt are required" });

    const tpl = await templateModel.create({
      userId,
      name: name.trim(),
      description: description || "Saved from assistant",
      category: category || "Custom",
      promptBody,
      variables: extractVariables(promptBody),
    });
    return res.status(200).json({ status: true, message: "Saved as template", data: tpl });
  } catch (err) {
    console.error("❌ createFromPrompt error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  getTemplates, getTemplate, createTemplate, updateTemplate,
  deleteTemplate, applyTemplate, restoreVersion, createFromPrompt,
};
