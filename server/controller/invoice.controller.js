const userModel = require("../model/user.model");
const invoiceModel = require("../model/invoice.model");
const { getNextSequence } = require("../model/counter.model");
const { generateInvoicePdf } = require("../helpers/invoicePdf");
const { saveImageToDB } = require("../cloudinaryImageHandler");
const emailHelper = require("../resendObject");
const sendUserEmail = require("../helpers/sendUserEmail");

// Map raw billingEvents.type → human grouping
const USAGE_GROUPS = {
  voice: {
    label: "AI Voice Calls",
    types: ["end-of-call-report", "call.ended", "call.analysis.completed"],
  },
  sms: {
    label: "SMS Messages",
    types: ["SMS_CHARGE"],
  },
};
const PAYMENT_TYPES = ["WALLET_TOPUP", "AUTO_WALLET_TOPUP"];

// ─── Generate an invoice for a date range ─────────────────────────────────────
const generateInvoice = async (req, res) => {
  try {
    const userId = req.user;
    const { periodStart, periodEnd } = req.body;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({ status: false, message: "periodStart and periodEnd are required" });
    }
    const start = new Date(periodStart);
    const end   = new Date(periodEnd);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start) || isNaN(end) || start > end) {
      return res.status(400).json({ status: false, message: "Invalid date range" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    // Filter billing events into the period
    const events = (user.billingEvents || []).filter((e) => {
      const t = new Date(e.processedAt);
      return t >= start && t <= end;
    });

    // Build usage line items
    const lineItems = [];
    let usageTotal = 0;

    Object.values(USAGE_GROUPS).forEach((group) => {
      const groupEvents = events.filter((e) => group.types.includes(e.type));
      if (groupEvents.length === 0) return;
      const amount = groupEvents.reduce((s, e) => s + (e.amount || 0), 0);
      const quantity = groupEvents.length;
      usageTotal += amount;
      lineItems.push({
        description: group.label,
        type: group.label,
        quantity,
        unitAmount: quantity ? amount / quantity : 0,
        amount,
      });
    });

    const paymentsTotal = events
      .filter((e) => PAYMENT_TYPES.includes(e.type))
      .reduce((s, e) => s + (e.amount || 0), 0);

    // Invoice number: INV-<year>-<seq padded>
    const year = end.getFullYear();
    const seq = await getNextSequence(`invoice-${year}`);
    const invoiceNumber = `INV-${year}-${String(seq).padStart(4, "0")}`;

    const company = user.company || {};

    const invoice = await invoiceModel.create({
      invoiceNumber,
      userId,
      status: "issued",
      periodStart: start,
      periodEnd: end,
      lineItems,
      usageTotal,
      paymentsTotal,
      total: usageTotal,
      currency: "USD",
      billedTo: {
        name:    company.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Customer",
        email:   user.email || "",
        address: company.address || "",
      },
      issuedAt: new Date(),
    });

    // Generate PDF → upload to Cloudinary
    try {
      const pdfBuffer = await generateInvoicePdf(invoice.toObject(), company);
      const upload = await saveImageToDB(pdfBuffer, "invoices", "raw", `${invoiceNumber}.pdf`);
      invoice.pdfUrl = upload.secure_url;
      await invoice.save();
    } catch (pdfErr) {
      console.error("⚠️ Invoice PDF generation/upload failed:", pdfErr.message);
      // Invoice still created; pdfUrl stays empty and can be regenerated
    }

    console.log(`✅ Invoice ${invoiceNumber} generated for user ${userId}`);
    return res.status(200).json({ status: true, message: "Invoice generated", data: invoice });
  } catch (err) {
    console.error("❌ generateInvoice error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── List invoices (paginated) ────────────────────────────────────────────────
const getInvoices = async (req, res) => {
  try {
    const userId = req.user;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      invoiceModel.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      invoiceModel.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      status: true,
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("❌ getInvoices error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Get one invoice ──────────────────────────────────────────────────────────
const getInvoice = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const invoice = await invoiceModel.findOne({ _id: id, userId }).lean();
    if (!invoice) return res.status(404).json({ status: false, message: "Invoice not found" });
    return res.status(200).json({ status: true, data: invoice });
  } catch (err) {
    console.error("❌ getInvoice error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Download — stream the PDF directly from our server (no Cloudinary 401) ────
const downloadInvoice = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const invoice = await invoiceModel.findOne({ _id: id, userId });
    if (!invoice) return res.status(404).json({ status: false, message: "Invoice not found" });

    const user = await userModel.findById(userId);
    const pdfBuffer = await generateInvoicePdf(invoice.toObject(), user.company || {});

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("❌ downloadInvoice error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// ─── Email the invoice to the customer ────────────────────────────────────────
const sendInvoiceEmail = async (req, res) => {
  try {
    const userId = req.user;
    const { id } = req.params;
    const invoice = await invoiceModel.findOne({ _id: id, userId });
    if (!invoice) return res.status(404).json({ status: false, message: "Invoice not found" });

    const to = invoice.billedTo?.email;
    if (!to) return res.status(400).json({ status: false, message: "No email on file for this invoice" });

    // Generate the PDF fresh and attach it to the email (no reliance on Cloudinary)
    const user = await userModel.findById(userId);
    const pdfBuffer = await generateInvoicePdf(invoice.toObject(), user.company || {});

    const money = (n) => `$${Number(n || 0).toFixed(2)}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#111827">Invoice ${invoice.invoiceNumber}</h2>
        <p style="color:#6B7280">Please find your invoice attached for the period
          ${new Date(invoice.periodStart).toLocaleDateString()} –
          ${new Date(invoice.periodEnd).toLocaleDateString()}.</p>
        <p style="font-size:18px;color:#111827"><strong>Total Due: ${money(invoice.total)}</strong></p>
        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">Thank you for your business.</p>
      </div>`;

    await sendUserEmail(userId, to, `Invoice ${invoice.invoiceNumber}`, html, [
      { filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer },
    ]);

    invoice.emailedAt = new Date();
    await invoice.save();

    return res.status(200).json({ status: true, message: `Invoice emailed to ${to}` });
  } catch (err) {
    console.error("❌ sendInvoiceEmail error:", err.message);
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  generateInvoice,
  getInvoices,
  getInvoice,
  downloadInvoice,
  sendInvoiceEmail,
};
