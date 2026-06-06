const crypto = require("crypto");
const apiKeyModel = require("../model/apiKey.model");

// Generate a customer API key: sk_live_<48 hex chars>
const generateApiKey = () => `sk_live_${crypto.randomBytes(24).toString("hex")}`;

const hashKey = (key) => crypto.createHash("sha256").update(key).digest("hex");

// Auth middleware for the public /api/v1 namespace.
// Accepts `Authorization: Bearer sk_live_…` or `x-api-key: sk_live_…`.
const verifyApiKey = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const headerKey = req.headers["x-api-key"];
    const key = headerKey || (auth.startsWith("Bearer ") ? auth.slice(7).trim() : null);

    if (!key) {
      return res.status(401).json({ status: false, message: "API key required" });
    }

    const record = await apiKeyModel.findOne({ hashedKey: hashKey(key), revoked: false });
    if (!record) {
      return res.status(401).json({ status: false, message: "Invalid or revoked API key" });
    }

    req.user = String(record.userId);
    req.apiKeyId = record._id;
    // Best-effort last-used stamp (don't block the request on it)
    apiKeyModel.updateOne({ _id: record._id }, { $set: { lastUsedAt: new Date() } }).catch(() => {});

    next();
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
};

module.exports = { generateApiKey, hashKey, verifyApiKey };
