// src/components/components-ghl/Sidebar/UserProfile.jsx
import React, { useState } from "react";
import { ChevronDown, ArrowLeft, Mail, Building2 } from "lucide-react";
import { useCurrentAccount } from "../../../hooks/useCurrentAccount";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export function UserProfile({ name = "Agency", users = "0", collapsed = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const account  = useCurrentAccount();
  const navigate = useNavigate();

  const displayName    = account ? decodeURIComponent(account.myname || name) : name;
  const displayInitial = (displayName || "A").charAt(0).toUpperCase();
  const subtext        = account
    ? decodeURIComponent(account.myemail || "Sub-account")
    : `${users} user${Number(users) !== 1 ? "s" : ""}`;

  /* ── Collapsed: avatar + tooltip ── */
  if (collapsed) {
    return (
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={displayName}
          className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 hover:border-indigo-500/40 flex items-center justify-center font-bold text-sm text-slate-300 transition-all"
        >
          {displayInitial}
        </button>
        <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
          <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {displayName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150 group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-slate-200">{displayInitial}</span>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-white truncate leading-none">{displayName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{subtext}</p>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-3 right-3 top-full mt-1 bg-[#131929] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {account ? (
                <>
                  {/* Account details */}
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Connected Account
                    </p>
                    <div className="flex items-start gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 font-mono break-all">
                        {(account.agencyid || "").slice(0, 16)}…
                      </p>
                    </div>
                    <div className="flex items-start gap-2 mt-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-400 truncate">
                        {decodeURIComponent(account.myemail || "")}
                      </p>
                    </div>
                  </div>

                  {/* Back to accounts */}
                  <div className="px-2 py-2">
                    <button
                      onClick={() => { setIsOpen(false); navigate("/"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to agency
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-slate-500">No account connected</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
