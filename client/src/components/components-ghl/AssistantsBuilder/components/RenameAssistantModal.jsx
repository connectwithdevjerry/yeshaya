// src/components/components-ghl/AssistantsBuilder/components/RenameAssistantModal.jsx
import React, { useState, useEffect } from "react";
import { X, Pencil, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { updateAssistant } from "../../../../store/slices/assistantsSlice";
import { useCurrentAccount } from "../../../../hooks/useCurrentAccount";
import toast from "react-hot-toast";

export const RenameAssistantModal = ({ isOpen, onClose }) => {
  const [assistantName, setAssistantName] = useState("");
  const [isSaving,      setIsSaving]      = useState(false);
  const [error,         setError]         = useState(null);

  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const account        = useCurrentAccount();

  const { selectedAssistant } = useSelector((s) => s.assistants);
  const subaccountId = searchParams.get("subaccount") || account?.subaccount;

  useEffect(() => {
    if (isOpen && selectedAssistant) {
      setAssistantName(selectedAssistant.name || "");
      setError(null);
    }
  }, [isOpen, selectedAssistant]);

  const handleSave = async () => {
    if (!assistantName.trim())                      { setError("Name cannot be empty");          return; }
    if (assistantName === selectedAssistant?.name)  { setError("That's already the current name"); return; }
    if (!subaccountId)                              { setError("No subaccount selected");         return; }
    if (!selectedAssistant?.id)                     { setError("No assistant selected");          return; }

    setIsSaving(true);
    setError(null);
    try {
      await dispatch(updateAssistant({
        subaccountId,
        assistantId: selectedAssistant.id,
        updateData: { name: assistantName.trim() },
      })).unwrap();
      toast.success("Assistant renamed!");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to rename assistant");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Rename Assistant</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Give your assistant a new name</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  New name
                </label>
                <input
                  type="text"
                  value={assistantName}
                  onChange={(e) => { setAssistantName(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && !isSaving && handleSave()}
                  placeholder="Enter assistant name…"
                  disabled={isSaving}
                  autoFocus
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder:text-gray-300"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedAssistant && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <p className="text-xs text-gray-400">
                    Current: <span className="font-medium text-gray-600">{selectedAssistant.name}</span>
                    <span className="ml-2 font-mono text-gray-400">· {selectedAssistant.id?.slice(0, 8)}…</span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={isSaving || !assistantName.trim()}
                whileHover={!isSaving && assistantName.trim() ? { scale: 1.02 } : {}}
                whileTap={!isSaving && assistantName.trim() ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
