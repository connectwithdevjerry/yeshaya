const axios = require("axios");
const userModel = require("../model/user.model");
const invoiceModel = require("../model/invoice.model");
const { getNextSequence } = require("../model/counter.model");
const { generateInvoicePdf } = require("../helpers/invoicePdf");
const { saveImageToDB } = require("../cloudinaryImageHandler");
const emailHelper = require("../resendObject");

const num = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

// Compute rebilling figures for the whole agency (per sub-account).
// Returns { prices, breakdown: [...] }
const computeBreakdown = async (user) => {
  const rb = user.snapshot?.rebilling || {};
  const prices = {
    voice: { enabled: !!rb.voice?.enabled, price: num(rb.voice?.price) },
    chat:  { enabled: !!rb.chat?.enabled,  price: num(rb.chat?.price)  },
    kb:    { enabled: !!rb.kb?.enabled,    price: num(rb.kb?.price)    },
    phone: { enabled: !!rb.phone?.enabled, price: num(rb.phone?.price) },
  };

  const assistantToAccount = {};
  const subStats = {};

  user.ghlSubAccountIds.forEach((sub) => {
    const id = sub.accountId;
    const phoneCount = (sub.vapiAssistants || []).reduce(
      (acc, a) => acc + (a.numberDetails?.length || 0), 0,
    );
    const kbCount = (sub.subAccountKnowledgeBaseToolIds || []).length;
    subStats[id] = {
      accountId: id,
      voice: { minutes: 0, calls: 0, billable: 0 },
      chat:  { messages: 0, billable: 0 },
      kb:    { count: kbCount, billable: 0 },
      phone: { count: phoneCount, billable: 0 },
      totalBillable: 0,
    };
    (sub.vapiAssistants || []).forEach((a) => {
      if (a.assistantId) assistantToAccount[a.assistantId] = id;
    });
  });

  const uniqueAssistantIds = Object.keys(assistantToAccount);
  if (uniqueAssistantIds.length > 0) {
    const callArrays = await Promise.all(
      uniqueAssistantIds.map((id) =>
        axios.get("https://api.vapi.ai/call", {
          params: { assistantId: id },
          headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
        }).then((r) => r.data.map((c) => ({ ...c, _assistantId: id }))).catch(() => []),
      ),
    );
    callArrays.flat().forEach((call) => {
      const accountId = assistantToAccount[call._assistantId];
      const stat = subStats[accountId];
      if (!stat) return;
      if (call.type === "chat" || call.type === "webChat") {
        stat.chat.messages += 1;
      } else {
        stat.voice.calls += 1;
        stat.voice.minutes += (call.durationSeconds || 0) / 60;
      }
    });
  }

  const breakdown = Object.values(subStats).map((s) => {
    s.voice.minutes = Math.round(s.voice.minutes * 100) / 100;
    s.voice.billable = prices.voice.enabled ? s.voice.minutes * prices.voice.price : 0;
    s.chat.billable  = prices.chat.enabled  ? s.chat.messages * prices.chat.price  : 0;
    s.kb.billable    = prices.kb.enabled    ? s.kb.count      * prices.kb.price     : 0;
    s.phone.billable = prices.phone.enabled ? s.phone.count   * prices.phone.price  : 0;
    s.totalBillable = Math.round((s.voice.billable + s.chat.billable + s.kb.billable + s.phone.billable) * 100) / 100;
    return s;
  });

  return { prices, breakdown };
};

// ─── Rebilling breakdown: per sub-account, per feature usage × rebilling price ──
const getRebillingBreakdown = async (req, res) => {
  try {
    const userId = req.user;
    console.log("🔄 getRebillingBreakdown → userId:", userId);

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const { prices, breakdown } = await computeBreakdown(user);

    console.log(`✅ getRebillingBreakdown → ${breakdown.length} sub-accounts`);
    return res.status(200).json({ status: true, prices, data: breakdown });
  } catch (err) {
    console.error("❌ getRebillingBreakdown error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Generate a rebilling invoice for ONE sub-account ─────────────────────────
const generateRebillingInvoice = async (req, res) => {
  try {
    const userId = req.user;
    const { subaccountId } = req.body;
    if (!subaccountId) {
      return res.status(400).json({ status: false, message: "subaccountId is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const sub = user.ghlSubAccountIds.find((s) => s.accountId === subaccountId);
    if (!sub) return res.status(404).json({ status: false, message: "Sub-account not found" });

    const { prices, breakdown } = await computeBreakdown(user);
    const row = breakdown.find((b) => b.accountId === subaccountId);
    if (!row) return res.status(404).json({ status: false, message: "No rebilling data for this sub-account" });

    if (row.totalBillable <= 0) {
      return res.status(400).json({
        status: false,
        message: "Nothing to invoice — no billable usage. Check your rebilling prices are enabled.",
      });
    }

    // Build line items from enabled features with usage
    const lineItems = [];
    if (prices.voice.enabled && row.voice.minutes > 0) {
      lineItems.push({
        description: "AI Voice Minutes",
        type: "voice",
        quantity: row.voice.minutes,
        unitAmount: prices.voice.price,
        amount: Math.round(row.voice.billable * 100) / 100,
      });
    }
    if (prices.chat.enabled && row.chat.messages > 0) {
      lineItems.push({
        description: "AI Chat Messages",
        type: "chat",
        quantity: row.chat.messages,
        unitAmount: prices.chat.price,
        amount: Math.round(row.chat.billable * 100) / 100,
      });
    }
    if (prices.phone.enabled && row.phone.count > 0) {
      lineItems.push({
        description: "Phone Numbers",
        type: "phone",
        quantity: row.phone.count,
        unitAmount: prices.phone.price,
        amount: Math.round(row.phone.billable * 100) / 100,
      });
    }
    if (prices.kb.enabled && row.kb.count > 0) {
      lineItems.push({
        description: "Knowledge Bases",
        type: "kb",
        quantity: row.kb.count,
        unitAmount: prices.kb.price,
        amount: Math.round(row.kb.billable * 100) / 100,
      });
    }

    const usageTotal = Math.round(row.totalBillable * 100) / 100;

    // Numbering — reuse the same sequence, prefix REB
    const year = new Date().getFullYear();
    const seq = await getNextSequence(`invoice-${year}`);
    const invoiceNumber = `REB-${year}-${String(seq).padStart(4, "0")}`;

    const company = user.company || {};
    const clientName = sub.customName || "Sub-account Client";

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const invoice = await invoiceModel.create({
      invoiceNumber,
      userId,
      kind: "rebilling",
      subaccountId,
      status: "issued",
      periodStart,
      periodEnd: now,
      lineItems,
      usageTotal,
      paymentsTotal: 0,
      total: usageTotal,
      currency: "USD",
      billedTo: {
        name: clientName,
        email: sub.clientEmail || "",
        address: "",
      },
      issuedAt: now,
    });

    // PDF — header shows YOUR agency, billed-to shows the client
    try {
      const pdfBuffer = await generateInvoicePdf(invoice.toObject(), company);
      const upload = await saveImageToDB(pdfBuffer, "invoices", "raw", `${invoiceNumber}.pdf`);
      invoice.pdfUrl = upload.secure_url;
      await invoice.save();
    } catch (pdfErr) {
      console.error("⚠️ Rebilling invoice PDF failed:", pdfErr.message);
    }

    console.log(`✅ generateRebillingInvoice → ${invoiceNumber} for ${subaccountId} ($${usageTotal})`);
    return res.status(200).json({ status: true, message: "Rebilling invoice generated", data: invoice });
  } catch (err) {
    console.error("❌ generateRebillingInvoice error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = { getRebillingBreakdown, generateRebillingInvoice };
