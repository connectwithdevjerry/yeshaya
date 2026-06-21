import React from "react";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";

// Small brand dot per provider
const BRAND = {
  GoHighLevel: "from-emerald-500 to-teal-600",
  OpenAI:      "from-slate-700 to-slate-900",
  Stripe:      "from-indigo-500 to-violet-600",
};

const StatusRow = ({ name, connected, detail }) => (
  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${BRAND[name] || "from-gray-400 to-gray-600"} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-[11px] font-bold">{name[0]}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{name}</p>
        <p className="text-[11px] text-gray-400 truncate">{detail}</p>
      </div>
    </div>
    <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${connected ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
      {connected ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {connected ? "Connected" : "Action"}
    </span>
  </div>
);

const OauthConnectionPopup = ({ onClose, items = [], loading, onRefresh }) => {
  const down = items.filter((i) => !i.connected).length;
  const allOk = items.length > 0 && down === 0;

  return (
    <div className="w-80 bg-white shadow-2xl shadow-gray-300/40 rounded-2xl border border-gray-100 overflow-hidden">
      {/* Summary banner */}
      <div className={`px-4 py-4 ${allOk ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-amber-500 to-orange-600"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            {allOk ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            <div>
              <p className="text-sm font-bold leading-tight">{allOk ? "All connected" : `${down} need${down === 1 ? "s" : ""} attention`}</p>
              <p className="text-[11px] text-white/80">Integration health</p>
            </div>
          </div>
          <button onClick={onRefresh} title="Refresh" className="p-1.5 rounded-lg text-white/90 hover:bg-white/20 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="p-2">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : (
          items.map((i) => <StatusRow key={i.name} {...i} />)
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end px-3 py-2.5 border-t border-gray-50 bg-gray-50/40">
        <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

export default OauthConnectionPopup;
