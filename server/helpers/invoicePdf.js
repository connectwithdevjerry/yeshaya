const PDFDocument = require("pdfkit");

const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

/**
 * Builds an invoice PDF and resolves to a Buffer.
 * @param {Object} invoice - the invoice document (plain object)
 * @param {Object} company - { name, address, logo, hex }
 */
const generateInvoicePdf = (invoice, company = {}) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const accent = (company.hex && /^#[0-9A-Fa-f]{6}$/.test(company.hex)) ? company.hex : "#6366F1";
      const gray = "#6B7280";
      const dark = "#111827";

      // ── Header ──
      doc.fillColor(accent).fontSize(26).font("Helvetica-Bold")
        .text("INVOICE", 50, 50);

      doc.fillColor(dark).fontSize(11).font("Helvetica-Bold")
        .text(company.name || "Yashayah AI", 50, 90);
      if (company.address) {
        doc.font("Helvetica").fillColor(gray).fontSize(9).text(company.address, 50, 106, { width: 250 });
      }

      // Invoice meta (right aligned)
      const metaX = 360;
      doc.fillColor(gray).font("Helvetica").fontSize(9);
      doc.text("Invoice Number", metaX, 90, { width: 180, align: "right" });
      doc.fillColor(dark).font("Helvetica-Bold").fontSize(11)
        .text(invoice.invoiceNumber, metaX, 102, { width: 180, align: "right" });

      doc.fillColor(gray).font("Helvetica").fontSize(9)
        .text("Issued", metaX, 124, { width: 180, align: "right" });
      doc.fillColor(dark).fontSize(10)
        .text(fmtDate(invoice.issuedAt || Date.now()), metaX, 136, { width: 180, align: "right" });

      doc.fillColor(gray).fontSize(9)
        .text("Billing Period", metaX, 156, { width: 180, align: "right" });
      doc.fillColor(dark).fontSize(10)
        .text(`${fmtDate(invoice.periodStart)} – ${fmtDate(invoice.periodEnd)}`, metaX, 168, { width: 180, align: "right" });

      // ── Bill To ──
      let y = 210;
      doc.fillColor(gray).font("Helvetica-Bold").fontSize(9).text("BILLED TO", 50, y);
      y += 14;
      doc.fillColor(dark).font("Helvetica-Bold").fontSize(11)
        .text(invoice.billedTo?.name || company.name || "Customer", 50, y);
      y += 15;
      doc.font("Helvetica").fillColor(gray).fontSize(9);
      if (invoice.billedTo?.email)   { doc.text(invoice.billedTo.email, 50, y); y += 12; }
      if (invoice.billedTo?.address) { doc.text(invoice.billedTo.address, 50, y, { width: 250 }); y += 12; }

      // ── Table header ──
      y = Math.max(y + 20, 290);
      const cols = { desc: 50, qty: 320, unit: 390, amount: 470 };
      doc.rect(50, y - 6, 495, 24).fill(accent);
      doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9);
      doc.text("DESCRIPTION", cols.desc + 6, y);
      doc.text("QTY", cols.qty, y, { width: 50, align: "right" });
      doc.text("UNIT", cols.unit, y, { width: 60, align: "right" });
      doc.text("AMOUNT", cols.amount, y, { width: 70, align: "right" });
      y += 26;

      // ── Line items ──
      doc.font("Helvetica").fontSize(10).fillColor(dark);
      const items = invoice.lineItems || [];
      if (items.length === 0) {
        doc.fillColor(gray).text("No usage charges for this period.", cols.desc + 6, y);
        y += 20;
      } else {
        items.forEach((item, i) => {
          if (i % 2 === 1) doc.rect(50, y - 4, 495, 20).fill("#F9FAFB");
          doc.fillColor(dark).font("Helvetica").fontSize(10);
          doc.text(item.description, cols.desc + 6, y, { width: 250 });
          doc.text(String(item.quantity ?? 0), cols.qty, y, { width: 50, align: "right" });
          doc.text(item.unitAmount ? money(item.unitAmount) : "—", cols.unit, y, { width: 60, align: "right" });
          doc.font("Helvetica-Bold").text(money(item.amount), cols.amount, y, { width: 70, align: "right" });
          y += 22;
        });
      }

      // ── Totals ──
      y += 10;
      doc.moveTo(330, y).lineTo(545, y).strokeColor("#E5E7EB").stroke();
      y += 12;

      const totalRow = (label, value, bold = false) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10);
        doc.fillColor(bold ? dark : gray).text(label, 330, y, { width: 130, align: "right" });
        doc.fillColor(dark).text(value, 470, y, { width: 75, align: "right" });
        y += bold ? 22 : 18;
      };

      totalRow("Usage Subtotal", money(invoice.usageTotal));
      totalRow("Total Due", money(invoice.total), true);

      // Payments received section
      if (invoice.paymentsTotal > 0) {
        y += 8;
        doc.fillColor(gray).font("Helvetica").fontSize(9)
          .text(`Wallet top-ups during this period: ${money(invoice.paymentsTotal)}`, 50, y, { width: 495, align: "left" });
      }

      // ── Footer ──
      const footerY = 760;
      doc.fillColor(gray).font("Helvetica").fontSize(8)
        .text(
          `${company.name || "Yashayah AI"} · Invoice ${invoice.invoiceNumber} · Generated ${fmtDate(Date.now())}`,
          50, footerY, { width: 495, align: "center" },
        );
      doc.text("This invoice was generated automatically based on recorded usage.", 50, footerY + 12, { width: 495, align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

module.exports = { generateInvoicePdf };
