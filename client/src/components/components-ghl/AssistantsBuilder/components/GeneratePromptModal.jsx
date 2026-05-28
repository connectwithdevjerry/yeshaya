// src/components/components-ghl/AssistantsBuilder/components/GeneratePromptModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Wand2, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generatePrompt, clearGeneratedPrompt } from "../../../../store/slices/assistantsSlice";

export const GeneratePromptModal = ({ isOpen, onClose, onPromptGenerated }) => {
  const dispatch     = useDispatch();
  const [description, setDescription] = useState("");

  const { generatingPrompt, generatedPrompt, promptError } = useSelector(
    (s) => s.assistants
  );

  useEffect(() => {
    if (generatedPrompt) {
      onPromptGenerated?.(generatedPrompt);
      setDescription("");
      dispatch(clearGeneratedPrompt());
      onClose();
    }
  }, [generatedPrompt]);

  useEffect(() => {
    if (!isOpen) {
      setDescription("");
      dispatch(clearGeneratedPrompt());
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    try {
      await dispatch(generatePrompt({ description: description.trim() })).unwrap();
    } catch {/* error shown via promptError */}
  };

  const handleClose = () => {
    if (!generatingPrompt) {
      setDescription("");
      dispatch(clearGeneratedPrompt());
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Generate Prompt</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Describe what your assistant should do</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={generatingPrompt}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={10}
                  placeholder="Explain exactly what you want in as much detail as you can. Describe the assistant's role, tone, goals, and any specific behaviors…"
                  disabled={generatingPrompt}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed font-mono leading-relaxed placeholder:text-gray-300"
                />
              </div>

              <AnimatePresence>
                {promptError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600"
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {promptError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleClose}
                disabled={generatingPrompt}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleGenerate}
                disabled={generatingPrompt || !description.trim()}
                whileHover={!generatingPrompt && description.trim() ? { scale: 1.02 } : {}}
                whileTap={!generatingPrompt && description.trim() ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generatingPrompt ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                ) : (
                  <><Wand2 className="w-3.5 h-3.5" /> Generate Prompt</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
