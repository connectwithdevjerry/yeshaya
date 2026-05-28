// src/components/components-ghl/Assistants/GenerateAssistantFormModal.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Sparkles, Type, AlignLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createAssistant } from "../../../store/slices/assistantsSlice";
import { useCurrentAccount } from "../../../hooks/useCurrentAccount";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300";

const GenerateAssistantFormModal = ({ isOpen, onClose }) => {
  const [name, setName]               = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]         = useState(false);

  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const account        = useCurrentAccount();

  const subaccountId = searchParams.get("subaccount") || account?.subaccount;
  const canSubmit    = name.trim() && subaccountId && !loading;

  const handleGenerate = async () => {
    if (!name.trim()) {
      toast.error("Assistant name is required");
      return;
    }
    if (!subaccountId) {
      toast.error("No subaccount selected");
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        createAssistant({ name, description, subaccountId })
      ).unwrap();
      toast.success("Assistant created!");
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("❌ Error creating assistant:", err);
      toast.error(err.message || "Failed to create assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Generate Assistant</h2>
                  <p className="text-xs text-gray-400 mt-0.5">AI-powered setup from your description</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <Type className="w-3 h-3" /> Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sales Assistant"
                  autoFocus
                  className={inputCls}
                />
              </div>

              {/* Description field */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <AlignLeft className="w-3 h-3" /> Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Briefly describe what this assistant should do, its tone, and any key goals…"
                  className={`${inputCls} resize-none leading-relaxed`}
                />
              </div>

              {/* Subaccount indicator */}
              {subaccountId && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-xs text-gray-400 font-mono">
                    Sub-account: {subaccountId.slice(0, 8)}…
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleGenerate}
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Assistant
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerateAssistantFormModal;
