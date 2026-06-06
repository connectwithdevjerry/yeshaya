const apiKeyModel = require("../model/apiKey.model");
const { generateApiKey, hashKey } = require("../helpers/apiKeyAuth");

// POST /integrations/api-keys  → create a key (full key returned ONCE)
const createApiKey = async (req, res) => {
  try {
    const userId = req.user;
    const { name } = req.body;

    const full = generateApiKey();
    const keyPrefix = `${full.slice(0, 16)}…`; // sk_live_ + first 8 chars

    const doc = await apiKeyModel.create({
      userId,
      name: (name && name.trim()) || "API Key",
      keyPrefix,
      hashedKey: hashKey(full),
    });

    return res.send({
      status: true,
      key: full, // shown once — never retrievable again
      data: { id: doc._id, name: doc.name, keyPrefix: doc.keyPrefix, createdAt: doc.createdAt },
      message: "Copy this key now — it won't be shown again.",
    });
  } catch (e) {
    console.error("createApiKey error:", e.message);
    return res.send({ status: false, message: e.message });
  }
};

// GET /integrations/api-keys → list masked keys
const listApiKeys = async (req, res) => {
  try {
    const keys = await apiKeyModel
      .find({ userId: req.user, revoked: false })
      .sort({ createdAt: -1 })
      .lean();

    return res.send({
      status: true,
      data: keys.map((k) => ({
        id: k._id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        lastUsedAt: k.lastUsedAt,
        createdAt: k.createdAt,
      })),
    });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// DELETE /integrations/api-keys/:id → revoke
const revokeApiKey = async (req, res) => {
  try {
    const result = await apiKeyModel.updateOne(
      { _id: req.params.id, userId: req.user },
      { $set: { revoked: true } },
    );
    if (result.matchedCount === 0) {
      return res.send({ status: false, message: "Key not found" });
    }
    return res.send({ status: true, message: "API key revoked" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

module.exports = { createApiKey, listApiKeys, revokeApiKey };
