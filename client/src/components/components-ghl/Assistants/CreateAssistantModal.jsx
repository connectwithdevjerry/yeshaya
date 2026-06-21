// src/components/components-ghl/Assistants/CreateAssistantModal.jsx
import React, { useState } from "react";
import { X, FileText, Upload, Layout, GitBranch, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GenerateAssistantFormModal from "./GenerateAssistantFormModal";

const OPTIONS = [
  {
    id: "generate",
    icon: Sparkles,
    title: "Generate Assistant",
    description: "Generate an assistant from your business profile and a brief description.",
    gradient: "from-indigo-500 to-violet-600",
    soft: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-500/30",
    section: "builder",
  },
  {
    id: "import-id",
    icon: Upload,
    title: "Import With ID",
    description: "Import an assistant using a unique ID to duplicate it in your account.",
    gradient: "from-sky-500 to-cyan-500",
    soft: "bg-sky-50",
    text: "text-sky-600",
    ring: "ring-sky-500/30",
    section: "builder",
  },
  {
    id: "blank-canvas",
    icon: Layout,
    title: "Blank Canvas",
    description: "Start from scratch with zero configuration and build exactly what you need.",
    gradient: "from-violet-500 to-purple-600",
    soft: "bg-violet-50",
    text: "text-violet-600",
    ring: "ring-violet-500/30",
    section: "builder",
  },
  {
    id: "flowbuilder",
    icon: GitBranch,
    title: "Flowbuilder",
    description: "An objective-based conversational pathway builder for intent and AI focus.",
    gradient: "from-amber-500 to-orange-500",
    soft: "bg-amber-50",
    text: "text-amber-600",
    ring: "ring-amber-500/30",
    section: "pathway",
    beta: true,
  },
];

const OptionCard = ({ option, selected, onClick }) => {
  const Icon = option.icon;
  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full text-left p-4 rounded-2xl border transition-all group
        ${selected
          ? `border-transparent ring-2 ${option.ring} bg-white shadow-md`
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
        }`}
    >
      {option.beta && (
        <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
          Beta
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-800">{option.title}</p>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{option.description}</p>
        </div>
      </div>
      {selected && (
        <motion.div
          layoutId="selected-check"
          className={`absolute bottom-3 right-3 w-5 h-5 rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <ArrowRight className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
};

const CreateAssistantModal = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState(null);
  const [isGenerateFormOpen, setIsGenerateFormOpen] = useState(false);

  const handleContinue = () => {
    if (!selected) return;
    if (selected === "generate") {
      setIsGenerateFormOpen(true);
    }
  };

  const builderOptions = OPTIONS.filter((o) => o.section === "builder");
  const pathwayOptions = OPTIONS.filter((o) => o.section === "pathway");

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create Assistant</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Choose how you'd like to build your next AI employee</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Assistant Builder section */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Assistant Builder
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {builderOptions.map((opt, i) => (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <OptionCard
                          option={opt}
                          selected={selected === opt.id}
                          onClick={() => setSelected(opt.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Conversational Pathway section */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Conversational Pathway
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pathwayOptions.map((opt, i) => (
                      <motion.div
                        key={opt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (builderOptions.length + i) * 0.06 }}
                      >
                        <OptionCard
                          option={opt}
                          selected={selected === opt.id}
                          onClick={() => setSelected(opt.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
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
                  onClick={handleContinue}
                  disabled={!selected}
                  whileHover={selected ? { scale: 1.02 } : {}}
                  whileTap={selected ? { scale: 0.98 } : {}}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GenerateAssistantFormModal
        isOpen={isGenerateFormOpen}
        onClose={() => setIsGenerateFormOpen(false)}
      />
    </>
  );
};

export default CreateAssistantModal;
