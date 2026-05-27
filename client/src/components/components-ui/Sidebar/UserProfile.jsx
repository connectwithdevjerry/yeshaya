// src/components/components-ui/Sidebar/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ChevronDown, Building2, Plus, CheckCircle2 } from "lucide-react";
import { getCompanyDetails } from "../../../store/slices/authSlice";
import { fetchImportedSubAccounts } from "../../../store/slices/integrationSlice";
import { AnimatePresence, motion } from "framer-motion";

export function UserProfile({ collapsed = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const { companyDetails, companyLoading } = useSelector((s) => s.auth);
  const { subAccounts, loading: subLoading } = useSelector((s) => s.integrations);

  useEffect(() => {
    dispatch(getCompanyDetails());
    // Use the same thunk as the SubAccounts page so both share one state key
    // without race-condition overwrites
    dispatch(fetchImportedSubAccounts());
  }, [dispatch]);

  const companyName  = companyDetails?.name || "Agency";
  const companyLogo  = companyDetails?.logo;
  const initial      = companyName.charAt(0).toUpperCase();
  const subCount     = subAccounts?.length || 0;

  const handleSubAccountClick = (sub) => {
    let targetRoute = "/assistants";
    if (location.pathname === "/app") {
      targetRoute = searchParams.get("route") || "/assistants";
    } else if (
      ["/inbox", "/call", "/contacts", "/knowledge", "/assistants",
       "/activetags", "/numbers", "/pools", "/widgets", "/helps", "/ghl_settings"]
        .includes(location.pathname)
    ) {
      targetRoute = location.pathname;
    }
    const p = new URLSearchParams({
      agencyid:   companyDetails?.id || companyDetails?.companyId || "UNKNOWN",
      subaccount: sub.id || "NO_ID",
      allow:      "yes",
      myname:     sub.name || sub.companyName || "NoName",
      myemail:    sub.email || "noemail@example.com",
      route:      targetRoute,
    });
    setIsOpen(false);
    setTimeout(() => navigate(`/app?${p.toString()}`), 0);
  };

  /* ── Collapsed: just the avatar ── */
  if (collapsed) {
    return (
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title={companyName}
          className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-slate-800 border border-white/10 hover:border-indigo-500/40 transition-all"
        >
          {companyLoading ? (
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : companyLogo ? (
            <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-indigo-400">{initial}</span>
          )}
        </button>

        {/* Tooltip */}
        <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
          <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {companyName}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 relative">
      {/* Trigger row */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150 group"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-slate-800 border border-white/10 flex-shrink-0">
          {companyLoading ? (
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : companyLogo ? (
            <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-indigo-400">{initial}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-semibold text-white truncate leading-none">{companyName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {subLoading ? "Loading…" : `${subCount} sub-account${subCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400" />
        </motion.div>
      </button>

      {/* Sub-accounts dropdown */}
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
              {/* Header */}
              <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500">
                  Sub-accounts
                </span>
                <span className="text-[10px] text-slate-600">{subCount}</span>
              </div>

              {/* List */}
              <div className="max-h-56 overflow-y-auto sidebar-scroll py-1">
                {subLoading ? (
                  <div className="flex items-center gap-2 px-4 py-3">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span className="text-xs text-slate-500">Loading…</span>
                  </div>
                ) : subAccounts?.length > 0 ? (
                  subAccounts.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubAccountClick(sub)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-indigo-900/40 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">
                          {sub.name || sub.companyName || "Unnamed"}
                        </p>
                        {sub.id && (
                          <p className="text-[10px] text-slate-600 truncate font-mono">
                            {sub.id.slice(0, 12)}…
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-5 text-center">
                    <Building2 className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">No sub-accounts found</p>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="border-t border-white/5 px-3 py-2">
                <button
                  onClick={() => { setIsOpen(false); navigate("/"); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Manage sub-accounts
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
