// src/components/components-ui/Integration/Webhooks.jsx
import React, { useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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

const EVENTS = [
  { key: "oauth",    name: "OAuth Events",   description: "Fired when a user connects or disconnects an OAuth integration."    },
  { key: "call",     name: "Call Events",    description: "Fired at the start, end, and during AI voice call sessions."        },
  { key: "message",  name: "Message Events", description: "Fired when an AI chat message is sent or received."                 },
  { key: "payment",  name: "Payment Events", description: "Fired on successful charges, refunds, and subscription changes."    },
];

const WebhooksContent = () => {
  const [endpointUrl, setEndpointUrl] = useState("");
  const [events,      setEvents]      = useState({ oauth: false, call: false, message: false, payment: false });
  const [saving,      setSaving]      = useState(false);

  const toggleEvent = (key) => setEvents((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    if (!endpointUrl.trim()) {
      toast.error("Please enter an endpoint URL");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900)); // stub — wire to real API when available
    setSaving(false);
    toast.success("Webhook settings saved");
  };

  const activeCount = Object.values(events).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Webhook Events</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Receive real-time HTTP POST notifications when events occur in your account.
        </p>
      </div>

      {/* Endpoint URL */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800">Endpoint URL</label>
        <p className="text-xs text-gray-500">All enabled events will be posted to this URL.</p>
        <input
          type="url"
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          placeholder="https://yourdomain.com/webhook"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-mono placeholder:text-gray-400"
        />
      </div>

      {/* Events list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-gray-800">Events</span>
          <span className="text-xs text-gray-400">{activeCount} of {EVENTS.length} enabled</span>
        </div>

        {EVENTS.map(({ key, name, description }, idx) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: idx * 0.05 }}
            className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border transition-colors
              ${events[key] ? "bg-white border-indigo-100" : "bg-gray-50/50 border-gray-100"}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
            <Toggle value={events[key]} onChange={() => toggleEvent(key)} />
          </motion.div>
        ))}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Webhook payloads are signed with a secret header for verification. See the docs for payload format details.
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-1 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default WebhooksContent;
