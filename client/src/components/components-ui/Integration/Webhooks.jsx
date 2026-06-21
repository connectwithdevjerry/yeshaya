// src/components/components-ui/Integration/Webhooks.jsx
import React, { useState, useEffect } from "react";
import { Info, Loader2, Copy, Send, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import apiClient from "../../../store/api/config";

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
  { key: "calls",    name: "Call Events",     description: "Fired when an AI voice call completes."                              },
  { key: "payments", name: "Payment Events",  description: "Fired on successful charges and low-balance alerts."                },
  { key: "contacts", name: "Contact Events",  description: "Fired when a new contact is created."                               },
  { key: "account",  name: "Account Events",  description: "Assistants, knowledge bases, numbers and sub-accounts."             },
  { key: "all",      name: "All Events",      description: "Catch-all — receive every event regardless of the toggles above."   },
];

const WebhooksContent = () => {
  const [endpointUrl, setEndpointUrl] = useState("");
  const [events,      setEvents]      = useState({ calls: false, payments: false, contacts: false, account: false, all: false });
  const [secret,      setSecret]      = useState("");
  const [saving,      setSaving]      = useState(false);
  const [testing,     setTesting]     = useState(false);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    apiClient.get("/integrations/webhook")
      .then((res) => {
        if (res.data.status && res.data.data) {
          const d = res.data.data;
          setEndpointUrl(d.endpointUrl || "");
          setSecret(d.secret || "");
          setEvents({
            calls: !!d.events?.calls, payments: !!d.events?.payments, contacts: !!d.events?.contacts,
            account: !!d.events?.account, all: !!d.events?.all,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleEvent = (key) => setEvents((p) => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    if (!endpointUrl.trim()) { toast.error("Please enter an endpoint URL"); return; }
    setSaving(true);
    try {
      const res = await apiClient.post("/integrations/webhook", { endpointUrl: endpointUrl.trim(), events, active: true });
      if (res.data.status) {
        setSecret(res.data.data?.secret || secret);
        toast.success("Webhook settings saved");
      } else toast.error(res.data.message || "Failed to save");
    } catch (e) { toast.error(e.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await apiClient.post("/integrations/webhook/test");
      res.data.status ? toast.success(res.data.message) : toast.error(res.data.message || "Test failed");
    } catch (e) { toast.error(e.response?.data?.message || "Test failed"); }
    finally { setTesting(false); }
  };

  const copySecret = () => navigator.clipboard.writeText(secret).then(() => toast.success("Secret copied")).catch(() => {});

  const activeCount = Object.values(events).filter(Boolean).length;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

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

      {/* Signing secret */}
      {secret && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800"><KeyRound className="w-3.5 h-3.5 text-gray-400" /> Signing secret</label>
          <p className="text-xs text-gray-500">Each payload is signed with HMAC-SHA256 in the <span className="font-mono">X-Webhook-Signature</span> header. Verify it with this secret.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 truncate">{secret}</code>
            <button onClick={copySecret} className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
        <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700 leading-relaxed">
          Payloads are JSON with <span className="font-mono">event</span>, <span className="font-mono">data</span>, and <span className="font-mono">timestamp</span> fields, POSTed to your endpoint. Save first, then send a test to verify delivery.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <button
          onClick={handleTest}
          disabled={testing || !endpointUrl.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Send test event
        </button>
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
