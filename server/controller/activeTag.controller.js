const activeTagModel = require("../model/activeTag.model");

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
