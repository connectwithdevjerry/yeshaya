// src/components/components-ui/Integration/Api.jsx
import React, { useEffect, useState } from "react";
import { Key, Copy, Trash2, Plus, KeyRound, Loader2, AlertTriangle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import apiClient, { API_BASE_URL } from "../../../store/api/config";

const copyToClipboard = (text) =>
  navigator.clipboard.writeText(text)
    .then(() => toast.success("Copied to clipboard"))
    .catch(() => toast.error("Copy failed"));

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const EmptyState = () => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <KeyRound className="w-6 h-6 text-indigo-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700">No API keys yet</p>
    <p className="text-xs text-gray-400 mt-1">Generate a key to let your systems call the API.</p>
  </motion.div>
);

const APIKeysContent = () => {
  const [keys, setKeys]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey]     = useState("");   // full key shown once
  const [name, setName]         = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/integrations/api-keys");
      if (res.data.status) setKeys(res.data.data || []);
      else toast.error(res.data.message || "Failed to load keys");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load keys");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post("/integrations/api-keys", { name: name.trim() || "API Key" });
      if (res.data.status && res.data.key) {
        setNewKey(res.data.key);
        setName("");
        toast.success("API key generated");
        load();
      } else {
        toast.error(res.data.message || "Failed to generate key");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to generate key");
    } finally { setGenerating(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await apiClient.delete(`/integrations/api-keys/${id}`);
      if (res.data.status) { setKeys((p) => p.filter((k) => k.id !== id)); toast.success("Key revoked"); }
      else toast.error(res.data.message || "Failed to revoke");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to revoke");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">API Keys</h3>
          <p className="text-xs text-gray-500 mt-0.5">{keys.length} active key{keys.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Key name (optional)"
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 disabled:opacity-60 transition-all">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Generate Key
          </button>
        </div>
      </div>

      {/* One-time reveal of a freshly created key */}
      <AnimatePresence>
        {newKey && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2 overflow-hidden">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">Copy your key now — it won't be shown again.</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-mono text-gray-800 break-all">{newKey}</code>
              <button onClick={() => copyToClipboard(newKey)} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={() => setNewKey("")} className="px-3 py-2 rounded-lg border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Usage hint */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-[11px] text-gray-500 font-mono break-all">
        Base URL: <span className="text-indigo-600">{API_BASE_URL}/api/v1</span>
        <br />Auth header: <span className="text-gray-700">Authorization: Bearer &lt;your_key&gt;</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : keys.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              <div className="col-span-3">Name</div>
              <div className="col-span-4">Key</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-2">Last used</div>
              <div className="col-span-1" />
            </div>
            <AnimatePresence initial={false}>
              {keys.map((k) => (
                <motion.div key={k.id}
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.18 }}
                  className="grid grid-cols-12 gap-4 items-center px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors group">
                  <div className="col-span-3 text-xs font-medium text-gray-700 truncate">{k.name}</div>
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Key className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                    <span className="text-xs font-mono text-gray-500 truncate">{k.keyPrefix}••••</span>
                  </div>
                  <div className="col-span-2 text-xs text-gray-500">{fmtDate(k.createdAt)}</div>
                  <div className="col-span-2 text-xs text-gray-500">{k.lastUsedAt ? fmtDate(k.lastUsedAt) : "Never"}</div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => handleDelete(k.id)} title="Revoke key"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default APIKeysContent;
