// src/components/components-ui/Setting/Invoices.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Download, Send, Loader2, X,
  Calendar, CheckCircle2, Receipt,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchInvoices, generateInvoice, downloadInvoice, sendInvoice,
} from "../../../store/slices/invoiceSlice";

const money = (n) =>
  `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

// ─── Generate Invoice Modal ───────────────────────────────────────────────────
const GenerateModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { generating } = useSelector((s) => s.invoices);

  // default: this month
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [periodStart, setPeriodStart] = useState(first);
  const [periodEnd,   setPeriodEnd]   = useState(today);

  const setThisMonth = () => { setPeriodStart(first); setPeriodEnd(today); };
  const setLastMonth = () => {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    setPeriodStart(s.toISOString().slice(0, 10));
    setPeriodEnd(e.toISOString().slice(0, 10));
  };

  const handleGenerate = async () => {
    if (!periodStart || !periodEnd) { toast.error("Pick a date range"); return; }
    if (periodStart > periodEnd)    { toast.error("Start date must be before end date"); return; }
    try {
      await dispatch(generateInvoice({ periodStart, periodEnd })).unwrap();
      toast.success("Invoice generated");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to generate invoice");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Generate Invoice</h3>
                <p className="text-xs text-gray-400 mt-0.5">Bill usage for a date range</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Quick presets */}
            <div className="flex gap-2">
              <button onClick={setThisMonth} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                This Month
              </button>
              <button onClick={setLastMonth} className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                Last Month
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">From</label>
                <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">To</label>
                <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} disabled={generating}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-60 flex items-center gap-2">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Plus className="w-4 h-4" /> Generate</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Invoices Content ────────────────────────────────────────────────────
const InvoicesContent = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.invoices);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null); // { id, action }

  useEffect(() => { dispatch(fetchInvoices()); }, [dispatch]);

  const handleDownload = async (id) => {
    setBusyId({ id, action: "download" });
    try {
      const url = await dispatch(downloadInvoice(id)).unwrap();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err || "Failed to open invoice");
    } finally {
      setBusyId(null);
    }
  };

  const handleSend = async (id) => {
    setBusyId({ id, action: "send" });
    try {
      const res = await dispatch(sendInvoice(id)).unwrap();
      toast.success(res.message || "Invoice emailed");
    } catch (err) {
      toast.error(err || "Failed to email invoice");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Invoices</h3>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} invoice{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all">
          <Plus className="w-3.5 h-3.5" /> Generate Invoice
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_1.5fr_0.8fr_0.7fr_1fr] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
          <div>Invoice</div><div>Period</div><div>Total</div><div>Status</div><div className="text-right">Actions</div>
        </div>

        <div className="min-h-[200px]">
          {loading && items.length === 0 ? (
            <div className="flex justify-center items-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-indigo-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">No invoices yet</p>
              <p className="text-xs text-gray-400 mt-1">Generate your first invoice for a billing period.</p>
            </div>
          ) : (
            items.map((inv) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-[1.2fr_1.5fr_0.8fr_0.7fr_1fr] gap-3 items-center px-4 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 truncate">{inv.invoiceNumber}</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {fmt(inv.periodStart)} – {fmt(inv.periodEnd)}
                </div>
                <div className="text-sm font-bold text-gray-900 tabular-nums">{money(inv.total)}</div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold capitalize">
                    {inv.status}
                  </span>
                  {inv.emailedAt && (
                    <span className="block text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> sent
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => handleDownload(inv._id)} disabled={!!busyId} title="Download PDF"
                    className="p-2 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-50">
                    {busyId?.id === inv._id && busyId?.action === "download"
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleSend(inv._id)} disabled={!!busyId} title="Email to customer"
                    className="p-2 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50">
                    {busyId?.id === inv._id && busyId?.action === "send"
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {modalOpen && <GenerateModal onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default InvoicesContent;
