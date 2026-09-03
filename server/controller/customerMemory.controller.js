// Dashboard API over the per-customer memory store.
//
// Two audiences:
//   - The agency, browsing what its assistants remember about each customer and
//     correcting or deleting it.
//   - The Chat Lab, which reads back the durable thread for the assistant being
//     tested so the UI matches what the assistant actually remembers.
//
// Every query is scoped by ownerUserId = req.user (the agency owner; team
// members already resolve to their owner in verifyAccessToken), so one agency
// can never read or delete another's memories.

const customerMemoryModel = require("../model/customerMemory.model");
const { identityKeyFor, identityLabel } = require("../helpers/customerMemory");

// Trim a memory down to what a list view needs — the turns array can be large.
const listView = (m) => ({
  _id: m._id,
  subaccountId: m.subaccountId,
  identityKey: m.identityKey,
  label: identityLabel(m),
  name: m.name,
  phone: m.phone,
  email: m.email,
  channels: m.channels,
  interactionCount: m.interactionCount,
  factCount: m.facts?.length || 0,
  turnCount: m.turns?.length || 0,
  lastAssistantId: m.lastAssistantId,
  lastInteractionAt: m.lastInteractionAt,
  optedOut: m.optedOut,
  updatedAt: m.updatedAt,
});

// GET /memory/list?subaccountId=&q=&page=&limit=
const listMemories = async (req, res) => {
  try {
    const { subaccountId, q } = req.query;
    const limit = Math.min(parseInt(req.query.limit, 10) || 25, 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const filter = { ownerUserId: req.user };
    if (subaccountId) filter.subaccountId = subaccountId;

    if (q && q.trim()) {
      // Escape the user's input — this is a search box, not a regex box.
      const safe = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(safe, "i");
      filter.$or = [{ name: rx }, { phone: rx }, { email: rx }, { identityKey: rx }];
    }

    const [rows, total] = await Promise.all([
      customerMemoryModel
        .find(filter)
        .sort({ lastInteractionAt: -1, updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      customerMemoryModel.countDocuments(filter),
    ]);

    return res.send({
      status: true,
      data: rows.map(listView),
      total,
      page,
      limit,
    });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// GET /memory/detail?id=
const getMemory = async (req, res) => {
  try {
    const memory = await customerMemoryModel
      .findOne({ _id: req.query.id, ownerUserId: req.user })
      .lean();
    if (!memory) return res.send({ status: false, message: "Memory not found" });

    return res.send({
      status: true,
      data: { ...memory, label: identityLabel(memory) },
    });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// PUT /memory/update  body: { id, summary?, facts?, name? }
// Lets the agency correct what an assistant "knows" without wiping the record.
const updateMemory = async (req, res) => {
  try {
    const { id, summary, facts, name } = req.body;

    const set = {};
    if (summary !== undefined) set.summary = String(summary);
    if (name !== undefined) set.name = String(name);
    if (Array.isArray(facts)) {
      set.facts = facts
        .filter((f) => f && String(f.key || "").trim())
        .map((f) => ({
          key: String(f.key).trim(),
          value: String(f.value ?? ""),
          source: f.source || "manual",
          assistantId: f.assistantId || "",
          updatedAt: new Date(),
        }));
    }
    if (!Object.keys(set).length) {
      return res.send({ status: false, message: "Nothing to update" });
    }

    const memory = await customerMemoryModel.findOneAndUpdate(
      { _id: id, ownerUserId: req.user },
      { $set: set },
      { new: true },
    );
    if (!memory) return res.send({ status: false, message: "Memory not found" });

    return res.send({ status: true, data: listView(memory), message: "Memory updated" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// PUT /memory/opt-out  body: { id, optedOut }
// Stops recording and injection for one customer without destroying the record.
const setOptOut = async (req, res) => {
  try {
    const { id, optedOut } = req.body;
    const memory = await customerMemoryModel.findOneAndUpdate(
      { _id: id, ownerUserId: req.user },
      { $set: { optedOut: !!optedOut } },
      { new: true },
    );
    if (!memory) return res.send({ status: false, message: "Memory not found" });

    return res.send({
      status: true,
      data: listView(memory),
      message: optedOut
        ? "This customer will no longer be remembered."
        : "Memory re-enabled for this customer.",
    });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// DELETE /memory/delete?id=   — permanent, for erasure requests.
const deleteMemory = async (req, res) => {
  try {
    const result = await customerMemoryModel.deleteOne({
      _id: req.query.id,
      ownerUserId: req.user,
    });
    if (result.deletedCount === 0) {
      return res.send({ status: false, message: "Memory not found" });
    }
    return res.send({ status: true, message: "Memory deleted" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// ─── Chat Lab ────────────────────────────────────────────────────────────────

// GET /memory/chat-history?assistantId=
// The dashboard's test thread for this assistant. Mirrors the identity that
// sendChatMessage records under, so the panel shows what the assistant recalls.
const getChatHistory = async (req, res) => {
  try {
    const identityKey = identityKeyFor({ userId: req.actingUserId || req.user });
    const memory = await customerMemoryModel
      .findOne({ ownerUserId: req.user, identityKey })
      .lean();

    const turns = (memory?.turns || [])
      .filter((t) => !req.query.assistantId || t.assistantId === req.query.assistantId)
      .map((t) => ({ role: t.role, content: t.content, at: t.at }));

    return res.send({ status: true, data: turns });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// DELETE /memory/chat-history?assistantId=
// "Start over" in the Chat Lab: drops this tester's turns for one assistant
// (or all of them when no assistantId is given).
const clearChatHistory = async (req, res) => {
  try {
    const { assistantId } = req.query;
    const identityKey = identityKeyFor({ userId: req.actingUserId || req.user });

    const memory = await customerMemoryModel.findOne({
      ownerUserId: req.user,
      identityKey,
    });
    if (!memory) return res.send({ status: true, message: "Nothing to clear" });

    if (assistantId) {
      memory.turns = memory.turns.filter((t) => t.assistantId !== assistantId);
      memory.interactions = memory.interactions.filter((i) => i.assistantId !== assistantId);
    } else {
      memory.turns = [];
      memory.interactions = [];
      memory.summary = "";
      memory.facts = [];
      memory.interactionCount = 0;
    }
    await memory.save();

    return res.send({ status: true, message: "Chat history cleared" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

module.exports = {
  listMemories,
  getMemory,
  updateMemory,
  setOptOut,
  deleteMemory,
  getChatHistory,
  clearChatHistory,
};
