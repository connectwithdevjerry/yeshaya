// src/components/components-ghl/AssistantsBuilder/components/LogsModal.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Activity, Phone, PhoneIncoming, PhoneOutgoing, Globe, Loader2, RefreshCw, Clock, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAssistantCallLogs } from "../../../../store/slices/assistantsSlice";

const fmtTime = (d) =>
  d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

const fmtDuration = (call) => {
  let secs = call.durationSeconds;
  if (!secs && call.startedAt && call.endedAt) {
    secs = (new Date(call.endedAt) - new Date(call.startedAt)) / 1000;
  }
  if (!secs || secs < 0) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const TypeIcon = ({ type }) => {
  if (type === "inboundPhoneCall") return <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" />;
  if (type === "outboundPhoneCall") return <PhoneOutgoing className="w-3.5 h-3.5 text-indigo-500" />;
  if (type === "webCall") return <Globe className="w-3.5 h-3.5 text-violet-500" />;
  return <Phone className="w-3.5 h-3.5 text-gray-400" />;
};

const statusStyle = (call) => {
  const r = (call.endedReason || "").toLowerCase();
  if (r.includes("voicemail")) return { label: "Voicemail", cls: "bg-amber-50 text-amber-600" };
  if (r.includes("customer-ended")) return { label: "Customer ended", cls: "bg-gray-100 text-gray-500" };
  if (r.includes("assistant-ended")) return { label: "AI ended", cls: "bg-emerald-50 text-emerald-600" };
  if (r.includes("no-answer") || r.includes("failed") || r.includes("error")) return { label: r || "Failed", cls: "bg-rose-50 text-rose-600" };
  if (call.status === "ended") return { label: "Completed", cls: "bg-emerald-50 text-emerald-600" };
  return { label: call.status || "—", cls: "bg-indigo-50 text-indigo-600" };
};

export const LogsModal = ({ isOpen, onClose, assistantId, subaccountId }) => {
  const dispatch = useDispatch();
  const { callLogs = [], fetchingLogs } = useSelector((s) => s.assistants);

  useEffect(() => {
    if (isOpen && subaccountId) dispatch(getAssistantCallLogs(subaccountId));
  }, [isOpen, subaccountId, dispatch]);

  // Only this assistant's calls
  const calls = (callLogs || []).filter((c) => !assistantId || c.assistantId === assistantId);
  const totalCost = calls.reduce((a, c) => a + (c.cost || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white w-full max-w-4xl h-[82vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Call Logs &amp; Activity</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {calls.length} call{calls.length !== 1 ? "s" : ""} · ${totalCost.toFixed(2)} total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => subaccountId && dispatch(getAssistantCallLogs(subaccountId))}
                  disabled={fetchingLogs}
                  className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${fetchingLogs ? "animate-spin" : ""}`} />
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50/40 p-5 overflow-y-auto">
              {fetchingLogs && calls.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
                  <p className="text-sm text-gray-400">Loading call logs…</p>
                </div>
              ) : calls.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">No calls yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">Calls handled by this assistant will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {calls.map((c, i) => {
                    const st = statusStyle(c);
                    return (
                      <motion.div
                        key={c.id || i}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <TypeIcon type={c.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {c.customer?.number || (c.type === "webCall" ? "Web call" : "Unknown")}
                            </p>
                            <p className="text-[11px] text-gray-400">{fmtTime(c.startedAt || c.createdAt)}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
                              <Clock className="w-3 h-3" /> {fmtDuration(c)}
                            </span>
                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400">
                              <DollarSign className="w-3 h-3" /> {(c.cost || 0).toFixed(2)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${st.cls}`}>{st.label}</span>
                          </div>
                        </div>
                        {(c.summary || c.analysis?.summary) && (
                          <p className="text-xs text-gray-500 mt-2 pl-11 leading-relaxed line-clamp-2">
                            {c.summary || c.analysis?.summary}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
