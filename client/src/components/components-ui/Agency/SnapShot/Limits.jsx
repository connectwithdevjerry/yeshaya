// src/components/components-ui/Agency/SnapShot/Limits.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot, MessageSquare, PhoneCall, Phone, Loader2 } from "lucide-react";
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

const FIELDS = [
  { key: "assistants", icon: Bot,         title: "Maximum Assistants",    label: "Unlimited assistants",                  placeholder: "e.g. 10"   },
  { key: "messages",   icon: MessageSquare,title: "Maximum Messages",      label: "Unlimited messages",                    placeholder: "e.g. 5000" },
  { key: "calling",    icon: PhoneCall,    title: "Maximum Call Minutes",  label: "Unlimited calling (pay-as-you-go)",     placeholder: "e.g. 200"  },
  { key: "phones",     icon: Phone,        title: "Maximum Phone Numbers", label: "Unlimited phone numbers",               placeholder: "e.g. 5"    },
];

const defaultLimited = { assistants: false, messages: false, calling: false, phones: false };
const defaultValues  = { assistants: "",    messages: "",    calling: "",    phones: ""    };

export default function LimitsTab() {
  const dispatch = useDispatch();
  const { snapshot, snapshotLoading } = useSelector((s) => s.auth);

  const [limited, setLimited] = useState(defaultLimited);
  const [values,  setValues]  = useState(defaultValues);

  useEffect(() => {
    dispatch(getSnapshot());
  }, [dispatch]);

  useEffect(() => {
    if (snapshot?.limits) {
      const l = snapshot.limits;
      setLimited({
        assistants: l.assistants?.enabled ?? false,
        messages:   l.messages?.enabled   ?? false,
        calling:    l.calling?.enabled    ?? false,
        phones:     l.phones?.enabled     ?? false,
      });
      setValues({
        assistants: l.assistants?.value ?? "",
        messages:   l.messages?.value   ?? "",
        calling:    l.calling?.value    ?? "",
        phones:     l.phones?.value     ?? "",
      });
    }
  }, [snapshot]);

  const toggleLimit = (key) => setLimited((p) => ({ ...p, [key]: !p[key] }));
  const setValue    = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    const limits = {
      assistants: { enabled: limited.assistants, value: values.assistants },
      messages:   { enabled: limited.messages,   value: values.messages   },
      calling:    { enabled: limited.calling,    value: values.calling    },
      phones:     { enabled: limited.phones,     value: values.phones     },
    };
    try {
      await dispatch(saveSnapshot({ limits })).unwrap();
      toast.success("Limit settings saved!");
    } catch (err) {
      toast.error(err || "Failed to save limits");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Usage Limits</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Cap resource usage for sub-accounts. Toggle to enforce a specific limit.
        </p>
      </div>

      <div className="space-y-3">
        {FIELDS.map(({ key, icon: Icon, title, label, placeholder }, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-3.5 rounded-xl border transition-colors
              ${limited[key] ? "bg-white border-indigo-100" : "bg-gray-50/50 border-gray-100"}`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
                ${limited[key] ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`flex items-center border rounded-xl overflow-hidden transition-all text-sm
                ${limited[key]
                  ? "border-gray-200 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
                  : "border-gray-100 bg-gray-100 opacity-50"
                }`}
              >
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={values[key]}
                  onChange={(e) => setValue(key, e.target.value)}
                  disabled={!limited[key]}
                  placeholder={placeholder}
                  className="w-28 py-2 px-3 text-sm font-mono text-gray-800 outline-none bg-transparent text-center disabled:cursor-not-allowed"
                />
              </div>
              <Toggle value={limited[key]} onChange={() => toggleLimit(key)} />
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
