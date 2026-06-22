const axios = require("axios");
const widgetModel = require("../model/widget.model");
const userModel = require("../model/user.model");
const { checkFeature, checkUsageLimit } = require("../helpers/snapshotLimits");

const VAPI_API_KEY = process.env.VAPI_API_KEY;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

// Is the requesting origin permitted? Empty allow-list = allow any domain.
const domainAllowed = (origin, allowed) => {
  if (!allowed || !allowed.length) return true;
  const h = hostOf(origin);
  if (!h) return false;
  return allowed.some((d) => {
    const dd = String(d)
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "")
      .toLowerCase();
    return dd && (h === dd || h.endsWith("." + dd));
  });
};

// Tiny in-memory sliding-window rate limiter (per widget + IP). Good enough to
// stop casual abuse of the unauthenticated, wallet-billing chat endpoint.
const RL = new Map();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 20;
const rateOk = (publicId, req) => {
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "")
    .split(",")[0]
    .trim();
  const key = `${publicId}:${ip}`;
  const now = Date.now();
  const hits = (RL.get(key) || []).filter((t) => now - t < RL_WINDOW_MS);
  if (hits.length >= RL_MAX) {
    RL.set(key, hits);
    return false;
  }
  hits.push(now);
  RL.set(key, hits);
  return true;
};

const publicView = (w) => ({
  _id: w._id,
  publicId: w.publicId,
  name: w.name,
  assistantId: w.assistantId,
  assistantName: w.assistantName,
  subaccountId: w.subaccountId,
  theme: w.theme,
  allowedDomains: w.allowedDomains,
  active: w.active,
  favorite: w.favorite,
  archived: w.archived,
  createdAt: w.createdAt,
  updatedAt: w.updatedAt,
});

// ─── Authenticated CRUD (agency dashboard) ───────────────────────────────────

// GET /widgets?subaccountId=
const listWidgets = async (req, res) => {
  try {
    const ownerUserId = req.user;
    const { subaccountId } = req.query;
    const filter = { ownerUserId };
    if (subaccountId) filter.subaccountId = subaccountId;
    const widgets = await widgetModel.find(filter).sort({ createdAt: -1 });
    return res.send({ status: true, data: widgets.map(publicView) });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// POST /widgets
const createWidget = async (req, res) => {
  try {
    const ownerUserId = req.user;
    const { name, assistantId, assistantName, subaccountId, theme, allowedDomains } = req.body;
    if (!name || !name.trim()) return res.send({ status: false, message: "Name is required" });
    if (!assistantId) return res.send({ status: false, message: "Please link an assistant" });

    const doc = await widgetModel.create({
      ownerUserId,
      subaccountId: subaccountId || "",
      name: name.trim(),
      assistantId,
      assistantName: assistantName || "",
      theme: theme || undefined,
      allowedDomains: Array.isArray(allowedDomains) ? allowedDomains.filter(Boolean) : [],
    });

    return res.send({ status: true, data: publicView(doc), message: "Widget created" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// PUT /widgets/:id
const updateWidget = async (req, res) => {
  try {
    const ownerUserId = req.user;
    const { name, assistantId, assistantName, theme, allowedDomains, active } = req.body;
    const set = {};
    if (name !== undefined) set.name = name;
    if (assistantId !== undefined) set.assistantId = assistantId;
    if (assistantName !== undefined) set.assistantName = assistantName;
    if (theme !== undefined) set.theme = theme;
    if (allowedDomains !== undefined) {
      set.allowedDomains = Array.isArray(allowedDomains) ? allowedDomains.filter(Boolean) : [];
    }
    if (active !== undefined) set.active = active;

    const doc = await widgetModel.findOneAndUpdate(
      { _id: req.params.id, ownerUserId },
      { $set: set },
      { new: true },
    );
    if (!doc) return res.send({ status: false, message: "Widget not found" });
    return res.send({ status: true, data: publicView(doc), message: "Updated" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// POST /widgets/:id/meta  (favorite / archived toggles)
const toggleWidgetMeta = async (req, res) => {
  try {
    const ownerUserId = req.user;
    const { favorite, archived } = req.body;
    const set = {};
    if (favorite !== undefined) set.favorite = favorite;
    if (archived !== undefined) set.archived = archived;

    const doc = await widgetModel.findOneAndUpdate(
      { _id: req.params.id, ownerUserId },
      { $set: set },
      { new: true },
    );
    if (!doc) return res.send({ status: false, message: "Widget not found" });
    return res.send({ status: true, data: publicView(doc) });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// DELETE /widgets/:id
const deleteWidget = async (req, res) => {
  try {
    const ownerUserId = req.user;
    const result = await widgetModel.deleteOne({ _id: req.params.id, ownerUserId });
    if (result.deletedCount === 0) return res.send({ status: false, message: "Widget not found" });
    return res.send({ status: true, message: "Deleted" });
  } catch (e) {
    return res.send({ status: false, message: e.message });
  }
};

// ─── Public (unauthenticated, called from the embedded widget) ───────────────

// GET /embed/:publicId/config  — theme + labels only, never any secret
const getWidgetConfig = async (req, res) => {
  try {
    const widget = await widgetModel.findOne({ publicId: req.params.publicId });
    if (!widget || widget.archived || !widget.active) {
      return res.status(404).json({ status: false, message: "Widget not found" });
    }
    return res.json({
      status: true,
      config: {
        publicId: widget.publicId,
        name: widget.name,
        theme: widget.theme,
      },
    });
  } catch (e) {
    return res.status(500).json({ status: false, message: e.message });
  }
};

// POST /embed/:publicId/chat  — stateless: the caller sends recent history
const widgetChat = async (req, res) => {
  // Generic, non-leaky failure reply shown to website visitors
  const unavailable = {
    status: false,
    reply: [{ role: "assistant", content: "Sorry, the assistant is unavailable right now. Please try again later." }],
  };
  try {
    const { publicId } = req.params;
    const { messages } = req.body;

    const widget = await widgetModel.findOne({ publicId });
    if (!widget || widget.archived || !widget.active) {
      return res.status(404).json({ status: false, message: "Widget not found or inactive" });
    }

    // Domain allow-list
    const origin = req.headers.origin || req.headers.referer || "";
    if (!domainAllowed(origin, widget.allowedDomains)) {
      return res.status(403).json({ status: false, message: "This domain is not authorized to use this widget." });
    }

    // Rate limit
    if (!rateOk(publicId, req)) {
      return res.status(429).json({ status: false, message: "Too many requests. Please slow down." });
    }

    const user = await userModel.findById(widget.ownerUserId);
    if (!user) return res.json(unavailable);

    // Wallet, feature gate, and monthly message cap — all surface as "unavailable"
    if (user.walletBalance <= 0) return res.json(unavailable);
    if (checkFeature(user, "chat")) return res.json(unavailable);
    if (checkUsageLimit(user, widget.subaccountId, "messages")) return res.json(unavailable);

    const history = (Array.isArray(messages) ? messages : [])
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-10);
    if (!history.length || history[history.length - 1].role !== "user") {
      return res.send({ status: false, message: "A user message is required" });
    }

    const response = await axios.post(
      "https://api.vapi.ai/chat",
      { assistantId: widget.assistantId, input: history },
      {
        headers: { Authorization: `Bearer ${VAPI_API_KEY}`, "Content-Type": "application/json" },
        timeout: 60_000,
      },
    );

    if (!Array.isArray(response.data.output) || response.data.output.length === 0) {
      return res.json(unavailable);
    }

    // Bill the owning agency's wallet (same shape as authed chat)
    const amount = response.data.cost || 0;
    user.walletBalance -= amount;
    user.billingEvents.push({
      callId: response.data.id,
      type: "chat_message",
      amount,
      subaccountId: widget.subaccountId || undefined,
    });
    await user.save();

    return res.send({ status: true, reply: response.data.output });
  } catch (e) {
    console.error("widgetChat error:", e.response?.data?.message || e.message);
    return res.json(unavailable);
  }
};

module.exports = {
  listWidgets,
  createWidget,
  updateWidget,
  toggleWidgetMeta,
  deleteWidget,
  getWidgetConfig,
  widgetChat,
};
