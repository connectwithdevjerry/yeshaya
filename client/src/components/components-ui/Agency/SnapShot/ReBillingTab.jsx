// src/components/components-ui/Agency/SnapShot/ReBillingTab.jsx
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

const ITEMS = [
  { key: "voice", icon: Mic,           label: "Charge For AI Voice Minutes",      note: "Price per minute",         placeholder: "0.07" },
  { key: "chat",  icon: MessageSquare, label: "Charge For AI Chat Messages",      note: "Price per message",        placeholder: "0.01" },
  { key: "kb",    icon: BookOpen,      label: "Charge For Voice Knowledge Bases", note: "Price per knowledge base", placeholder: "5.00" },
  { key: "phone", icon: Phone,         label: "Charge For Phone Numbers",         note: "Price per number / mo",    placeholder: "3.00" },
];

const defaultCharges = { voice: false, chat: false, kb: false, phone: false };
const defaultPrices  = { voice: "",    chat: "",    kb: "",    phone: ""    };

export default function ReBillingTab() {
  const dispatch = useDispatch();
  const { snapshot, snapshotLoading } = useSelector((s) => s.auth);

  const [charges, setCharges] = useState(defaultCharges);
  const [prices,  setPrices]  = useState(defaultPrices);

  useEffect(() => {
    dispatch(getSnapshot());
  }, [dispatch]);

  useEffect(() => {
    if (snapshot?.rebilling) {
      const rb = snapshot.rebilling;
      setCharges({
        voice: rb.voice?.enabled ?? false,
        chat:  rb.chat?.enabled  ?? false,
        kb:    rb.kb?.enabled    ?? false,
        phone: rb.phone?.enabled ?? false,
      });
      setPrices({
        voice: rb.voice?.price ?? "",
        chat:  rb.chat?.price  ?? "",
        kb:    rb.kb?.price    ?? "",
        phone: rb.phone?.price ?? "",
      });
    }
  }, [snapshot]);

  const toggleCharge = (key) => setCharges((p) => ({ ...p, [key]: !p[key] }));
  const setPrice     = (key, val) => setPrices((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    const rebilling = {
      voice: { enabled: charges.voice, price: prices.voice },
      chat:  { enabled: charges.chat,  price: prices.chat  },
      kb:    { enabled: charges.kb,    price: prices.kb    },
      phone: { enabled: charges.phone, price: prices.phone },
    };
    try {
      await dispatch(saveSnapshot({ rebilling })).unwrap();
      toast.success("Re-billing settings saved!");
    } catch (err) {
      toast.error(err || "Failed to save re-billing settings");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Re-billing Configuration</h3>
        <p className="text-xs text-gray-500 mt-0.5">Set default per-usage charges applied to new sub-accounts.</p>
      </div>

      <div className="space-y-3">
        {ITEMS.map(({ key, icon: Icon, label, note, placeholder }, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 rounded-xl border transition-colors
              ${charges[key] ? "bg-white border-indigo-100" : "bg-gray-50/50 border-gray-100"}`}
          >
            {/* Label */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${charges[key] ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{note}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`flex items-center border rounded-xl overflow-hidden transition-all text-sm
                ${charges[key]
                  ? "border-gray-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
                  : "border-gray-100 bg-gray-100 opacity-50"
                }`}
              >
                <span className="px-2.5 text-gray-400 font-medium select-none">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={prices[key]}
                  onChange={(e) => setPrice(key, e.target.value)}
                  disabled={!charges[key]}
                  placeholder={placeholder}
                  className="w-20 py-2 pr-3 text-sm font-mono text-gray-800 outline-none bg-transparent disabled:cursor-not-allowed"
                />
              </div>
              <Toggle value={charges[key]} onChange={() => toggleCharge(key)} />
            </div>
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
          Save Changes
        </button>
      </div>
    </div>
  );
}
