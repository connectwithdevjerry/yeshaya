// server/helpers/appointmentEmails.js

const fmtWhen = (startTime, timezone) => {
  try {
    return new Date(startTime).toLocaleString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    });
  } catch {
    return new Date(startTime).toLocaleString();
  }
};

const shell = (accent, inner) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;background:#fff;border:1px solid #eee;border-radius:14px;overflow:hidden">
    <div style="height:5px;background:${accent}"></div>
    <div style="padding:28px">${inner}</div>
    <div style="padding:14px 28px;background:#f9fafb;color:#9ca3af;font-size:11px;text-align:center">
      This is an automated message regarding your appointment.
    </div>
  </div>`;

const detailRow = (label, value) => `
  <tr>
    <td style="padding:6px 0;color:#6b7280;font-size:13px;width:90px">${label}</td>
    <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:600">${value}</td>
  </tr>`;

const confirmationEmail = ({ customerName, when, businessName, title }) =>
  shell("#10b981", `
    <h2 style="color:#111827;margin:0 0 6px">Appointment Confirmed ✅</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 18px">
      Hi ${customerName || "there"}, your appointment with <strong>${businessName}</strong> is booked.
    </p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;margin-bottom:18px">
      ${detailRow("When", when)}
      ${title ? detailRow("Details", title) : ""}
      ${detailRow("With", businessName)}
    </table>
    <p style="color:#9ca3af;font-size:12px;margin:0">We look forward to speaking with you.</p>
  `);

const reminderEmail = ({ customerName, when, businessName, whenLabel }) =>
  shell("#6366f1", `
    <h2 style="color:#111827;margin:0 0 6px">Reminder: Appointment ${whenLabel} ⏰</h2>
    <p style="color:#6b7280;font-size:14px;margin:0 0 18px">
      Hi ${customerName || "there"}, this is a reminder of your upcoming appointment with <strong>${businessName}</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;margin-bottom:18px">
      ${detailRow("When", when)}
      ${detailRow("With", businessName)}
    </table>
    <p style="color:#9ca3af;font-size:12px;margin:0">See you soon!</p>
  `);

module.exports = { fmtWhen, confirmationEmail, reminderEmail };
