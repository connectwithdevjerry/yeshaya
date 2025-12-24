import React from "react";
import { X } from "lucide-react";

// Using real brand icons/logos to match the screenshot
const OpenAIIcon = () => (
  <img src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg" alt="OpenAI" className="w-8 h-8 rounded-md" />
);
const AnthropicIcon = () => (
  <div className="w-8 h-8 bg-[#D97757] rounded-md flex items-center justify-center text-white font-bold text-xs">AI</div>
);
const GoogleIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Gemini_logo.svg" alt="Google" className="w-8 h-8" />
);

const modelGroups = [
  { 
    title: "OpenAI", 
    models: [
      { name: "GPT-5", provider: "OpenAI", icon: <OpenAIIcon /> },
      { name: "GPT-5 Mini", provider: "OpenAI", icon: <OpenAIIcon /> },
      { name: "GPT-5 Nano", provider: "OpenAI", icon: <OpenAIIcon /> },
      { name: "GPT-4.1", provider: "OpenAI", icon: <OpenAIIcon /> },
      { name: "GPT-4.1 mini", provider: "OpenAI", icon: <OpenAIIcon /> },
      { name: "GPT-4.1 nano", provider: "OpenAI", icon: <OpenAIIcon /> },
      { name: "GPT-4o", provider: "OpenAI", icon: <OpenAIIcon />, active: true },
      { name: "GPT-4o mini", provider: "OpenAI", icon: <OpenAIIcon /> },
    ] 
  },
  { 
    title: "Anthropic", 
    models: [
      { name: "Claude 3.7 sonnet", provider: "Anthropic", icon: <AnthropicIcon /> },
    ] 
  },
  { 
    title: "Google", 
    models: [
      { name: "Gemini 2.0 Flash", provider: "Google", icon: <GoogleIcon /> },
      { name: "Gemini 2.0 Flash Lite", provider: "Google", icon: <GoogleIcon /> },
    ] 
  },
];

const AIModelItem = ({ name, provider, icon, active }) => (
  <div 
    className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200
      ${active ? "bg-gray-100/80 shadow-sm" : "hover:bg-gray-50"}`}
  >
    <div className="flex-shrink-0">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[13px] font-semibold text-gray-900 leading-tight">{name}</span>
      <span className="text-[11px] text-gray-400">{provider}</span>
    </div>
  </div>
);

export const AIModelModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200] flex justify-center items-start pt-16">
      <div 
        className="bg-white rounded-xl shadow-2xl w-[850px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-md font-bold text-gray-900">AI Models</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Multi-Column Grid Layout */}
        <div className="flex p-6 min-h-[400px]">
          {modelGroups.map((group, idx) => (
            <div key={group.title} className={`flex-1 ${idx !== 0 ? "ml-8" : ""}`}>
              <h4 className="text-[13px] font-medium text-gray-400 mb-4 px-2">
                {group.title}
              </h4>
              <div className="space-y-3">
                {group.models.map((model) => (
                  <AIModelItem key={model.name} {...model} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};