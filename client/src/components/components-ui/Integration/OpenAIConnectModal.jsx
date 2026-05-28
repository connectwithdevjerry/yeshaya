// src/components/components-ui/Integration/OpenAIConnectModal.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X, Loader2, CheckCircle2 } from "lucide-react";
import { connectOpenAI } from "../../../store/slices/integrationSlice";

const OpenAIModal = ({ onClose, isOpen }) => {
  const [apiKey,  setApiKey]  = useState("");
  const [showKey, setShowKey] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, connected, message } = useSelector(
    (state) => state.integrations.openAI
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    dispatch(connectOpenAI(apiKey));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 12  }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <img
                      src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg"
                      alt="OpenAI"
                      className="w-5 h-5 rounded object-contain"
                    />
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Connect OpenAI</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800">
                    OpenAI API Key
                  </label>
                  <p className="text-xs text-gray-500">
                    Find your key at{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-500 hover:underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                  <div className="relative mt-1">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-••••••••••••••••••••••••"
                      className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    {typeof error === "string" ? error : error.message}
                  </p>
                )}
                {connected && !error && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {message}
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !apiKey.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Connecting…" : "Connect"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OpenAIModal;
