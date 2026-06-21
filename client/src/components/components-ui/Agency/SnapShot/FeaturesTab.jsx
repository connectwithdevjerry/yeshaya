// src/components/components-ui/Agency/SnapShot/FeaturesTab.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mic, MessageSquare, BookOpen, Phone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getSnapshot, saveSnapshot } from "../../../../store/slices/authSlice";

/* ── Indigo gradient toggle ── */
const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
      ${value ? "bg-gradient-to-r from-indigo-500 to-violet-600" : "bg-gray-200"}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
        ${value ? "translate-x-4" : "translate-x-0.5"}`}
    />
  </button>
);

const FEATURES = [
  { key: "voice",  icon: Mic,           title: "AI Voice Calls",    desc: "Enable AI-powered voice assistant calls for sub-accounts.",         color: "bg-indigo-50 text-indigo-600"  },
  { key: "chat",   icon: MessageSquare, title: "AI Chat Messages",  desc: "Allow sub-accounts to use AI chat messaging features.",              color: "bg-violet-50 text-violet-600"  },
  { key: "kb",     icon: BookOpen,      title: "Knowledge Bases",   desc: "Grant access to voice knowledge base creation and retrieval.",        color: "bg-emerald-50 text-emerald-600"},
  { key: "phones", icon: Phone,         title: "Phone Numbers",     desc: "Allow sub-accounts to provision and manage phone numbers.",           color: "bg-amber-50 text-amber-600"    },
];

export default function FeaturesTab() {
  const dispatch = useDispatch();
  const { snapshot, snapshotLoading } = useSelector((s) => s.auth);

  const [enabled, setEnabled] = useState({ voice: true, chat: true, kb: false, phones: true });

  useEffect(() => {
    dispatch(getSnapshot());
  }, [dispatch]);

  useEffect(() => {
    if (snapshot?.features) setEnabled(snapshot.features);
  }, [snapshot]);

  const toggle = (key) => setEnabled((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    try {
      await dispatch(saveSnapshot({ features: enabled })).unwrap();
      toast.success("Feature settings saved!");
    } catch (err) {
      toast.error(err || "Failed to save features");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Feature Access</h3>
        <p className="text-xs text-gray-500 mt-0.5">Choose which features are enabled for new sub-accounts by default.</p>
      </div>

      <div className="space-y-3">
        {FEATURES.map(({ key, icon: Icon, title, desc, color }, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className="flex items-center gap-4 px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <Toggle value={enabled[key]} onChange={() => toggle(key)} />
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={snapshotLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60"
        >
          {snapshotLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Features
        </button>
      </div>
    </div>
  );
}
