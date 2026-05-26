// src/components/components-ui/Sidebar/BottomInfo.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Settings, CreditCard, Phone, ChevronUp, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import UserMenuPopup from "../UserMenu";
import { fetchAssistants } from "../../../store/slices/assistantsSlice";
import { fetchPurchasedNumbers } from "../../../store/slices/numberSlice";
import { fetchSubAccounts } from "../../../store/slices/integrationSlice";
import { getUserDetails } from "../../../store/slices/authSlice";

export function BottomInfo({ balance, collapsed = false }) {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const [isOpen,        setIsOpen]        = useState(false);
  const [subaccounts,   setSubaccounts]   = useState([]);
  const [allAssistants, setAllAssistants] = useState([]);
  const [loadingData,   setLoadingData]   = useState(false);
  const [numbersFetched,setNumbersFetched]= useState(false);

  const { purchasedNumbers, loadingPurchased } = useSelector((s) => s.numbers);
  const { user, loading: userLoading }         = useSelector((s) => s.auth);

  useEffect(() => { dispatch(getUserDetails()); }, [dispatch]);

  useEffect(() => {
    const get = async () => {
      try {
        setLoadingData(true);
        const r = await dispatch(fetchSubAccounts()).unwrap();
        setSubaccounts(r?.locations || []);
      } catch { setSubaccounts([]); }
      finally { setLoadingData(false); }
    };
    get();
  }, [dispatch]);

  useEffect(() => {
    if (subaccounts.length > 0 && allAssistants.length === 0) {
      const get = async () => {
        try {
          setLoadingData(true);
          const results = await Promise.all(
            subaccounts.map((s) => dispatch(fetchAssistants(s.id)).unwrap())
          );
          setAllAssistants(
            results.flatMap((a, i) =>
              (a || []).map((ast) => ({
                ...ast,
                subaccountId: subaccounts[i].id,
                subaccountName: subaccounts[i].name || subaccounts[i].companyName,
              }))
            )
          );
        } catch { setAllAssistants([]); }
        finally { setLoadingData(false); }
      };
      get();
    }
  }, [dispatch, subaccounts, allAssistants.length]);

  useEffect(() => {
    if (allAssistants.length > 0 && !numbersFetched) {
      setNumbersFetched(true);
      Promise.all(
        allAssistants.map((a) =>
          dispatch(fetchPurchasedNumbers({ subaccountId: a.subaccountId, assistantId: a.id || a.assistantId }))
        )
      ).catch(() => setNumbersFetched(false));
    }
  }, [dispatch, allAssistants, numbersFetched]);

  const totalNumbers = useMemo(() => {
    if (!purchasedNumbers?.length) return 0;
    const seen = new Set();
    return purchasedNumbers.filter((n) => {
      const sid = n.phoneNumberDetails?.sid || n.sid;
      if (!sid || seen.has(sid)) return false;
      seen.add(sid); return true;
    }).length;
  }, [purchasedNumbers]);

  const isLoading = loadingData || loadingPurchased;
  const userInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U";
  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

  /* ── Collapsed mode: just the avatar + tooltip ── */
  if (collapsed) {
    return (
      <div className="border-t border-white/5 p-3 flex flex-col items-center gap-2">
        {/* Settings icon */}
        <Link
          to="/settings"
          title="Settings"
          className="group relative p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4" />
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
            <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">Settings</div>
          </div>
        </Link>

        {/* User avatar */}
        <div className="relative group">
          <button
            onClick={() => setIsOpen(!isOpen)}
            title={userName || "User"}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 transition-all"
          >
            {userLoading && !user ? <Loader2 className="w-3 h-3 animate-spin" /> : userInitial}
          </button>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0f1e] rounded-full" />

          {/* Tooltip */}
          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
            <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
              {userName || "Account"}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-0 left-full ml-3 z-50 w-64"
              >
                <UserMenuPopup />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="border-t border-white/5 px-3 pb-3 pt-2 space-y-1">

      {/* Stats row */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div
          onClick={() => navigate("/settings?tab=billing")}
          className="flex-1 flex items-center gap-2 cursor-pointer group"
        >
          <CreditCard className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Balance</span>
        </div>
        <span className="text-xs font-semibold text-white tabular-nums">{balance || "$0.00"}</span>
      </div>

      <div className="flex items-center gap-2 px-2 py-1.5">
        <Phone className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span className="text-xs text-slate-500 flex-1">Numbers</span>
        <span className="text-xs font-semibold text-white tabular-nums">
          {isLoading
            ? <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            : totalNumbers
          }
        </span>
      </div>

      {/* Settings link */}
      <Link
        to="/settings"
        className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all duration-150"
      >
        <Settings className="w-4 h-4" />
        <span className="text-xs font-medium">Settings</span>
      </Link>

      {/* Divider */}
      <div className="border-t border-white/5 my-1" />

      {/* User trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-150 group"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              {userLoading && !user ? <Loader2 className="w-3 h-3 animate-spin" /> : userInitial}
            </div>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0a0f1e] rounded-full" />
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-semibold text-white leading-none truncate">
              {userName || (userLoading ? "Loading…" : "User")}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {user?.email || ""}
            </p>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-full left-0 mb-2 z-50 w-full"
              >
                <UserMenuPopup />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
