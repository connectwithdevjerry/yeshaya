const crypto = require("crypto");
const userModel = require("../model/user.model");

const findSub = (user, subaccountId) =>
  user.ghlSubAccountIds.find((s) => s.accountId === subaccountId);

// ─── List pools for a sub-account ─────────────────────────────────────────────
const getPools = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId } = req.query;
    if (!subaccountId) return res.status(400).json({ status: false, message: "subaccountId is required" });

    const user = await userModel.findById(userId);
    const sub = findSub(user, subaccountId);
    if (!sub) return res.status(404).json({ status: false, message: "Sub-account not found" });

    const pools = (sub.numberPools || []).map((p) => ({
      poolId:      p.poolId,
      name:        p.name,
      numberSids:  p.numberSids || [],
      numberCount: (p.numberSids || []).length,
      createdAt:   p.createdAt,
    }));

    return res.status(200).json({ status: true, data: pools });
  } catch (err) {
    console.error("❌ getPools error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Create a pool ────────────────────────────────────────────────────────────
const createPool = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId, name } = req.body;
    if (!subaccountId) return res.status(400).json({ status: false, message: "subaccountId is required" });

    const user = await userModel.findById(userId);
    const sub = findSub(user, subaccountId);
    if (!sub) return res.status(404).json({ status: false, message: "Sub-account not found" });

    if (!Array.isArray(sub.numberPools)) sub.numberPools = [];

    const pool = {
      poolId: crypto.randomBytes(8).toString("hex"),
      name: (name || "").trim() || `Pool ${sub.numberPools.length + 1}`,
      numberSids: [],
      createdAt: new Date(),
    };
    sub.numberPools.push(pool);
    user.markModified("ghlSubAccountIds");
    await user.save();

    return res.status(200).json({ status: true, message: "Pool created", data: pool });
  } catch (err) {
    console.error("❌ createPool error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Rename a pool ────────────────────────────────────────────────────────────
const updatePool = async (req, res) => {
  try {
    const userId = req.user;
    const { poolId } = req.params;
    const { subaccountId, name } = req.body;

    const user = await userModel.findById(userId);
    const sub = findSub(user, subaccountId);
    if (!sub) return res.status(404).json({ status: false, message: "Sub-account not found" });

    const pool = (sub.numberPools || []).find((p) => p.poolId === poolId);
    if (!pool) return res.status(404).json({ status: false, message: "Pool not found" });

    if (name !== undefined) pool.name = name.trim() || pool.name;
    user.markModified("ghlSubAccountIds");
    await user.save();

    return res.status(200).json({ status: true, message: "Pool updated", data: { poolId, name: pool.name } });
  } catch (err) {
    console.error("❌ updatePool error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Delete a pool (numbers stay, just unassigned) ────────────────────────────
const deletePool = async (req, res) => {
  try {
    const userId = req.user;
    const { poolId } = req.params;
    const { subaccountId } = req.query;

    const user = await userModel.findById(userId);
    const sub = findSub(user, subaccountId);
    if (!sub) return res.status(404).json({ status: false, message: "Sub-account not found" });

    sub.numberPools = (sub.numberPools || []).filter((p) => p.poolId !== poolId);
    user.markModified("ghlSubAccountIds");
    await user.save();

    return res.status(200).json({ status: true, message: "Pool deleted" });
  } catch (err) {
    console.error("❌ deletePool error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Set the numbers assigned to a pool ───────────────────────────────────────
const setPoolNumbers = async (req, res) => {
  try {
    const userId = req.user;
    const { poolId } = req.params;
    const { subaccountId, numberSids } = req.body;

    if (!Array.isArray(numberSids)) {
      return res.status(400).json({ status: false, message: "numberSids must be an array" });
    }

    const user = await userModel.findById(userId);
    const sub = findSub(user, subaccountId);
    if (!sub) return res.status(404).json({ status: false, message: "Sub-account not found" });

    const pool = (sub.numberPools || []).find((p) => p.poolId === poolId);
    if (!pool) return res.status(404).json({ status: false, message: "Pool not found" });

    pool.numberSids = [...new Set(numberSids)];
    user.markModified("ghlSubAccountIds");
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Pool numbers updated",
      data: { poolId, numberSids: pool.numberSids, numberCount: pool.numberSids.length },
    });
  } catch (err) {
    console.error("❌ setPoolNumbers error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = { getPools, createPool, updatePool, deletePool, setPoolNumbers };
