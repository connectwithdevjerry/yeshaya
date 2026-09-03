// src/components/components-ghl/AssistantsBuilder/components/AiModelModal.jsx
import React, { useState } from "react";
import { X, Check, Loader2, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { updateAssistant } from "../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import toast from "react-hot-toast";

const OpenAIIcon  = () => <img src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg" alt="OpenAI" className="w-7 h-7 rounded-lg object-cover" />;
const AnthropicIcon = () => <img src="https://cdn.builtin.com/cdn-cgi/image/f=auto,fit=contain,w=200,h=200,q=100/sites/www.builtin.com/files/2022-09/3_50.jpg" alt="Anthropic" className="w-7 h-7 rounded-lg object-cover" />;
const GoogleIcon  = () => <img src="https://cdn-icons-png.flaticon.com/128/15465/15465679.png" alt="Google" className="w-7 h-7" />;

const modelNameMap = {
  "GPT-5":              { api: "gpt-5",                          provider: "openai"    },
  "GPT-5 Mini":         { api: "gpt-5-mini",                     provider: "openai"    },
  "GPT-5 Nano":         { api: "gpt-5-nano",                     provider: "openai"    },
  "GPT-4.1":            { api: "gpt-4.1",                        provider: "openai"    },
  "GPT-4.1 mini":       { api: "gpt-4.1-mini",                   provider: "openai"    },
  "GPT-4.1 nano":       { api: "gpt-4.1-nano",                   provider: "openai"    },
  "GPT-4o":             { api: "gpt-4o",                         provider: "openai"    },
  "GPT-4o mini":        { api: "gpt-4o-mini",                    provider: "openai"    },
  "Claude 3.7 sonnet":  { api: "claude-3-7-sonnet-20250219",     provider: "anthropic" },
  "Gemini 2.0 Flash":   { api: "gemini-2.0-flash",               provider: "google"    },
  "Gemini 2.0 Flash Lite": { api: "gemini-2.0-flash-lite",       provider: "google"    },
};

const modelGroups = [
  {
    title: "OpenAI",
    gradient: "from-emerald-500 to-teal-500",
    soft: "bg-emerald-50",
    models: [
      { name: "GPT-5",       icon: <OpenAIIcon /> },
      { name: "GPT-5 Mini",  icon: <OpenAIIcon /> },
      { name: "GPT-5 Nano",  icon: <OpenAIIcon /> },
      { name: "GPT-4.1",     icon: <OpenAIIcon /> },
      { name: "GPT-4.1 mini",icon: <OpenAIIcon /> },
      { name: "GPT-4.1 nano",icon: <OpenAIIcon /> },
      { name: "GPT-4o",      icon: <OpenAIIcon /> },
      { name: "GPT-4o mini", icon: <OpenAIIcon /> },
    ],
  },
  {
    title: "Anthropic",
    gradient: "from-amber-500 to-orange-500",
    soft: "bg-amber-50",
    models: [
      { name: "Claude 3.7 sonnet", icon: <AnthropicIcon /> },
    ],
  },
  {
    title: "Google",
    gradient: "from-sky-500 to-blue-600",
    soft: "bg-sky-50",
    models: [
      { name: "Gemini 2.0 Flash",      icon: <GoogleIcon /> },
      { name: "Gemini 2.0 Flash Lite", icon: <GoogleIcon /> },
    ],
  },
];

const AIModelItem = ({ name, icon, isActive, onClick, isSaving }) => (
  <motion.div
    whileHover={{ x: 3 }}
    onClick={onClick}
    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
      isActive
        ? "bg-indigo-50 border border-indigo-200 shadow-sm"
        : "hover:bg-gray-50 border border-transparent"
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <span className={`text-sm font-semibold leading-tight ${isActive ? "text-indigo-700" : "text-gray-800"}`}>
        {name}
      </span>
    </div>
    {isActive && (
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
        {isSaving
          ? <Loader2 className="w-3 h-3 text-white animate-spin" />
          : <Check className="w-3 h-3 text-white" />
        }
      </div>
    )}
  </motion.div>
);

export const AIModelModal = ({ isOpen, onClose }) => {
  const dispatch     = useDispatch();
  const [searchParams] = useSearchParams();
  const { selectedAssistant } = useSelector((s) => s.assistants);
  const [isSaving,       setIsSaving]       = useState(false);
  const [selectedModel,  setSelectedModel]  = useState(null);

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);
  const currentModel    = selectedAssistant?.model?.model;
  const currentProvider = selectedAssistant?.model?.provider;

  const handleModelSelect = async (displayName) => {
    if (!selectedAssistant || isSaving) return;
    const modelInfo = modelNameMap[displayName];
    if (!modelInfo) return;

    setIsSaving(true);
    setSelectedModel(displayName);
    try {
      await dispatch(updateAssistant({
        subaccountId,
        assistantId,
        updateData: {
          model: { ...selectedAssistant.model, provider: modelInfo.provider, model: modelInfo.api },
        },
      })).unwrap();
      toast.success(`Switched to ${displayName}`);
      setTimeout(onClose, 400);
    } catch (err) {
      toast.error(`Failed to update: ${err}`);
    } finally {
      setIsSaving(false);
      setSelectedModel(null);
    }
  };

  const isModelActive = (displayName) => {
    const info = modelNameMap[displayName];
    return info?.api === currentModel && info?.provider === currentProvider;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200] flex justify-center items-start pt-16 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">AI Models</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Active: <span className="font-mono">{currentProvider} / {currentModel}</span>
                  </p>
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

            {/* Grid */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 p-2 min-h-[360px]">
              {modelGroups.map((group) => (
                <div key={group.title} className="p-4 space-y-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${group.gradient} flex items-center justify-center`}>
                      <span className="text-[9px] font-black text-white">{group.title[0]}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{group.title}</span>
                  </div>
                  {group.models.map((model) => (
                    <AIModelItem
                      key={model.name}
                      name={model.name}
                      icon={model.icon}
                      isActive={isModelActive(model.name)}
                      onClick={() => handleModelSelect(model.name)}
                      isSaving={isSaving && selectedModel === model.name}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                {isSaving ? (
                  <><Loader2 className="w-3 h-3 animate-spin text-indigo-500" /> Updating model…</>
                ) : (
                  "Click any model to switch instantly"
                )}
              </p>
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
