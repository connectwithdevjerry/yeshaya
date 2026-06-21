const axios = require("axios");
const activeTagModel = require("../model/activeTag.model");
const VAPI_API_KEY = process.env.VAPI_API_KEY;

// Ensure the assistant has the add_tag tool, then inject a prompt instruction
// telling the AI when to apply this specific tag. Best-effort — never blocks
// the tag from being created.
const autoWireAssistant = async (userId, assistantId, tag) => {
  try {
    // 1) Fetch the Vapi assistant
    const aRes = await axios.get(`https://api.vapi.ai/assistant/${assistantId}`, {
      headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
    });
    const assistant = aRes.data;
    const model = assistant.model || {};
    const toolIds = model.toolIds || [];

    // 2) Ensure add_tag tool is attached (check existing tools by function name)
    let hasAddTag = false;
    if (toolIds.length) {
      const tools = await Promise.all(
        toolIds.map((id) =>
          axios.get(`https://api.vapi.ai/tool/${id}`, { headers: { Authorization: `Bearer ${VAPI_API_KEY}` } })
            .then((r) => r.data).catch(() => null),
        ),
      );
      hasAddTag = tools.some((t) => t?.function?.name === "add_tag");
    }
    if (!hasAddTag) {
      try {
        const { createTool, linkToolToAssistant } = require("./assistant.controller");
        const toolId = await createTool("add_tag", userId);
        await linkToolToAssistant(assistantId, toolId, userId);
      } catch (e) {
        console.error("⚠️ auto-attach add_tag failed:", e.message);
      }
    }

    // 3) Inject a prompt instruction (idempotent — skip if already present)
    const line = `When ${tag.instruction || "appropriate based on the conversation"}, apply the tag "${tag.name}" to the contact using the add_tag tool.`;
    const currentPrompt = model.systemPrompt || "";
    if (!currentPrompt.includes(`apply the tag "${tag.name}"`)) {
      const newPrompt = `${currentPrompt}\n\n[Active Tag] ${line}`.trim();
      await axios.patch(
        `https://api.vapi.ai/assistant/${assistantId}`,
        { model: { ...model, systemPrompt: newPrompt } },
        { headers: { Authorization: `Bearer ${VAPI_API_KEY}` } },
      );
    }
  } catch (e) {
    console.error("⚠️ autoWireAssistant failed:", e.response?.data?.message || e.message);
  }
};

// GET /active-tags?subaccountId=
const listActiveTags = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId } = req.query;
    const filter = { userId };
    if (subaccountId) filter.subaccountId = subaccountId;
    const tags = await activeTagModel.find(filter).sort({ createdAt: -1 }).lean();
    return res.send({ status: true, data: tags });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// POST /active-tags
const createActiveTag = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, name, assistantId, assistantName, instruction } = req.body;
    if (!subaccountId || !name || !name.trim()) {
      return res.send({ status: false, message: "subaccountId and name are required" });
    }
    const doc = await activeTagModel.create({
      userId,
      subaccountId,
      name: name.trim(),
      assistantId: assistantId || "",
      assistantName: assistantName || "",
      instruction: instruction || "",
    });

    // Auto-wire: attach add_tag tool + inject prompt guidance (best-effort)
    if (assistantId) {
      await autoWireAssistant(userId, assistantId, doc);
    }

    return res.send({ status: true, data: doc, message: "Active tag created" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// PUT /active-tags/:id
const updateActiveTag = async (req, res) => {
  try {
    const userId = req.user;
    const { name, assistantId, assistantName, instruction } = req.body;
    const set = {};
    if (name !== undefined)          set.name = name;
    if (assistantId !== undefined)   set.assistantId = assistantId;
    if (assistantName !== undefined) set.assistantName = assistantName;
    if (instruction !== undefined)   set.instruction = instruction;

    const doc = await activeTagModel.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: set },
      { new: true },
    );
    if (!doc) return res.send({ status: false, message: "Active tag not found" });
    return res.send({ status: true, data: doc, message: "Updated" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// DELETE /active-tags/:id
const deleteActiveTag = async (req, res) => {
  try {
    const userId = req.user;
    const result = await activeTagModel.deleteOne({ _id: req.params.id, userId });
    if (result.deletedCount === 0) return res.send({ status: false, message: "Active tag not found" });
    return res.send({ status: true, message: "Deleted" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

module.exports = { listActiveTags, createActiveTag, updateActiveTag, deleteActiveTag };
