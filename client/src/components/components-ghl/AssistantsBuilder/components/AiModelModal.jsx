// src/components/assistant/AIModelModal.jsx
import React from "react";
import { X, Globe, Star, Zap, Check } from "lucide-react";

// --- Model Groups ---
const modelGroups = [
  { 
    title: "OpenAI", 
    models: [
      { name: "GPT-5", icon: Globe },
      { name: "GPT-5 Mini", icon: Globe },
      { name: "GPT-5 Nano", icon: Globe },
      { name: "GPT-4.1", icon: Globe },
      { name: "GPT-4.1 Mini", icon: Globe },
      { name: "GPT-4.1 Nano", icon: Globe },
      { name: "GPT-4o", icon: Globe, active: true },
      { name: "GPT-4o Mini", icon: Globe },
    ] 
  },
  { 
    title: "Anthropic", 
    models: [
      { name: "Claude 3.7 Sonnet", icon: Star, badge: "Anthropic" },
    ] 
  },
  { 
    title: "Google", 
    models: [
      { name: "Gemini 2.0 Flash", icon: Zap, badge: "Google" },
      { name: "Gemini 2.0 Flash Lite", icon: Zap, badge: "Google" },
    ] 
  },
];

// --- Model Item ---
const AIModelItem = ({ name, icon: Icon, badge, active }) => (
  <div 
    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-150
      ${active ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}`}
  >
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-600"}`} />
      <div>
        <p className="text-sm font-medium text-gray-800">{name}</p>
        <p className="text-xs text-gray-500">{badge || "OpenAI"}</p>
      </div>
    </div>
    {active && <Check className="w-4 h-4 text-blue-600" />}
  </div>
);

// --- Modal ---
export const AIModelModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-start pt-20"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-[30rem] max-h-[80vh] flex flex-col absolute top-14 left-1/2 transform -translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">AI Models</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {modelGroups.map((group) => (
            <div key={group.title}>
              <h4 className="px-2 pt-1 pb-2 text-xs font-semibold uppercase text-gray-500">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.models.map((model) => (
                  <AIModelItem key={model.name} {...model} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
