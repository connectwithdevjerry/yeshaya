// src/pages/pages-ui/Agency.jsx
import React, { useState, useEffect } from "react";
import { Settings, Globe, Layers, Shield, Lock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import BrandingTab  from "../../components/components-ui/Agency/BrandingTab";
import DomainTab    from "../../components/components-ui/Agency/DomainTab";
import SnapshotTab  from "../../components/components-ui/Agency/SnapShotTab";
import AdminTab     from "../../components/components-ui/Agency/AdminTab";
import { getAdminSettings, verifyAdminLock } from "../../store/slices/authSlice";

const TABS = [
  { id: "branding",  label: "Branding",  icon: Settings },
  { id: "domain",    label: "Domain",    icon: Globe    },
  { id: "snapshot",  label: "Snapshot",  icon: Layers   },
  { id: "admin",     label: "Admin",     icon: Shield   },
];

// ── Admin lock gate ──
const AdminLockGate = ({ onUnlock }) => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      await dispatch(verifyAdminLock(password)).unwrap();
      sessionStorage.setItem("agencyAdminUnlocked", "1");
      onUnlock();
    } catch (err) {
      toast.error(err || "Incorrect password");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex items-center justify-center px-4">
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-indigo-500" />
        </div>
        <h2 className="text-base font-bold text-gray-900">Admin area locked</h2>
        <p className="text-xs text-gray-400 mt-1 mb-5">Enter your admin lock password to continue.</p>
        <input type="password" value={password} autoFocus onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 mb-3" />
        <button type="submit" disabled={busy || !password}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Unlock
        </button>
      </motion.form>
    </div>
  );
};

function Agency() {
  const [activeTab, setActiveTab] = useState("branding");
  const dispatch = useDispatch();
  const { adminSettings } = useSelector((s) => s.auth);
  const [unlocked, setUnlocked] = useState(sessionStorage.getItem("agencyAdminUnlocked") === "1");

  useEffect(() => { dispatch(getAdminSettings()); }, [dispatch]);

  const locked = adminSettings?.hasAdminPassword && !unlocked;
  if (locked) return <AdminLockGate onUnlock={() => setUnlocked(true)} />;

  const content = {
    branding: <BrandingTab />,
    domain:   <DomainTab />,
    snapshot: <SnapshotTab />,
    admin:    <AdminTab />,
  }[activeTab];

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Agency</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your agency branding, domain, snapshots, and admin settings.
          </p>
        </motion.div>

        {/* ── Card with tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1 flex-wrap">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.12 }}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150
                    ${isActive
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}

                  {isActive && (
                    <motion.span
                      layoutId="agencyTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}

export default Agency;
