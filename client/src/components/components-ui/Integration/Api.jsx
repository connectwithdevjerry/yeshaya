// src/components/components-ui/Integration/Api.jsx
import React, { useState } from "react";
import { Key, Copy, Trash2, Plus, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const copyToClipboard = (text) =>
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied to clipboard"))
    .catch(() => toast.error("Copy failed"));

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-14 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <KeyRound className="w-6 h-6 text-indigo-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700">No API keys yet</p>
    <p className="text-xs text-gray-400 mt-1">Generate a key to start using the REST API.</p>
  </motion.div>
);

const APIKeysContent = () => {
  const [keys, setKeys] = useState([]);

  const handleGenerate = () => {
    const newKey = {
      id:      crypto.randomUUID(),
      key:     "sk-" + crypto.randomUUID().replace(/-/g, "").slice(0, 32),
      created: new Date().toLocaleDateString(),
      expires: "Never",
      version: "v1",
      visible: false,
    };
    setKeys((p) => [newKey, ...p]);
    toast.success("New API key generated");
  };

  const handleDelete = (id) => {
    setKeys((p) => p.filter((k) => k.id !== id));
    toast.success("Key deleted");
  };

  const toggleVisible = (id) =>
    setKeys((p) => p.map((k) => k.id === id ? { ...k, visible: !k.visible } : k));

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">REST API Keys</h3>
          <p className="text-xs text-gray-500 mt-0.5">{keys.length} key{keys.length !== 1 ? "s" : ""} active</p>
        </div>
        <button
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Generate Key
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 overflow-hidden">
        {keys.length > 0 && (
          <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <div>Key</div>
            <div>Created</div>
            <div>Expires</div>
            <div>Version</div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {keys.length === 0 ? (
            <EmptyState />
          ) : (
            keys.map((k) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.18 }}
                className="grid grid-cols-4 gap-4 items-center px-5 py-4 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors group"
              >
                {/* Key cell */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                  <span
                    className="text-xs font-mono text-gray-700 truncate cursor-pointer"
                    onClick={() => toggleVisible(k.id)}
                    title="Click to reveal"
                  >
                    {k.visible ? k.key : k.key.slice(0, 8) + "••••••••••••••••••••••"}
                  </span>
                  <button
                    onClick={() => copyToClipboard(k.key)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-indigo-500 transition-all flex-shrink-0"
                    title="Copy key"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-gray-500">{k.created}</span>
                <span className="text-xs text-gray-500">{k.expires}</span>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 font-semibold">
                    {k.version}
                  </span>
                  <button
                    onClick={() => handleDelete(k.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                    title="Delete key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default APIKeysContent;
