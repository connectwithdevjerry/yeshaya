const crypto = require("crypto");
const axios = require("axios");
const webhookModel = require("../model/webhook.model");

// Notification type → webhook event group
const TYPE_GROUP = {
  call_completed:       "calls",
  payment_received:     "payments",
  low_balance:          "payments",
  new_contact:          "contacts",
  subaccount_imported:  "account",
  knowledge_base_added: "account",
  assistant_created:    "account",
  number_purchased:     "account",
};

const signPayload = (body, secret) =>
  crypto.createHmac("sha256", secret || "").update(body).digest("hex");

// Fire a webhook for an event (best-effort; never throws into the caller)
const dispatchWebhook = async (userId, { type, title, message, metadata }) => {
  try {
    const cfg = await webhookModel.findOne({ userId });
    if (!cfg || !cfg.active || !cfg.endpointUrl) return;

    const group = TYPE_GROUP[type] || "all";
    const enabled = cfg.events?.[group] || cfg.events?.all;
    if (!enabled) return;

    const body = JSON.stringify({
      event: type,
      group,
      title,
      message,
      data: metadata || {},
      timestamp: new Date().toISOString(),
    });

    await axios.post(cfg.endpointUrl, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": type,
        "X-Webhook-Signature": signPayload(body, cfg.secret),
      },
      timeout: 8000,
    });
  } catch (e) {
    console.error("⚠️ webhook dispatch failed:", e.response?.status || e.message);
  }
};

module.exports = { dispatchWebhook, signPayload };
