import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { updateAssistant } from "../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../utils/urlUtils";

// Using real brand icons/logos to match the screenshot
const OpenAIIcon = () => (
  <img src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg" alt="OpenAI" className="w-8 h-8 rounded-md" />
);
const AnthropicIcon = () => (
  <img src="https://cdn.builtin.com/cdn-cgi/image/f=auto,fit=contain,w=200,h=200,q=100/sites/www.builtin.com/files/2022-09/3_50.jpg" alt="Anthropic" className="w-8 h-8 rounded-md" />
);
const GoogleIcon = () => (
  <img src="https://cdn-icons-png.flaticon.com/128/15465/15465679.png" alt="Google" className="w-8 h-8" />
);

// Map display names to API values
const modelNameMap = {
  // OpenAI
  "GPT-5": { api: "gpt-5", provider: "openai" },
  "GPT-5 Mini": { api: "gpt-5-mini", provider: "openai" },
  "GPT-5 Nano": { api: "gpt-5-nano", provider: "openai" },
  "GPT-4.1": { api: "gpt-4.1", provider: "openai" },
  "GPT-4.1 mini": { api: "gpt-4.1-mini", provider: "openai" },
  "GPT-4.1 nano": { api: "gpt-4.1-nano", provider: "openai" },
  "GPT-4o": { api: "gpt-4o", provider: "openai" },
  "GPT-4o mini": { api: "gpt-4o-mini", provider: "openai" },
  
  // Anthropic
  "Claude 3.7 sonnet": { api: "claude-3-7-sonnet-20250219", provider: "anthropic" },
  
  // Google
  "Gemini 2.0 Flash": { api: "gemini-2.0-flash", provider: "google" },
  "Gemini 2.0 Flash Lite": { api: "gemini-2.0-flash-lite", provider: "google" },
};

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
      { name: "GPT-4o", provider: "OpenAI", icon: <OpenAIIcon /> },
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

const AIModelItem = ({ name, provider, icon, isActive, onClick, isSaving }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between space-x-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200
      ${isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"}`}
  >
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={`text-[13px] font-semibold leading-tight ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
          {name}
        </span>
        <span className="text-[11px] text-gray-400">{provider}</span>
      </div>
    </div>
    {isActive && (
      <div className="flex-shrink-0">
        {isSaving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : (
          <Check className="w-4 h-4 text-blue-600" />
        )}
      </div>
    )}
  </div>
);

export const AIModelModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);

  // Get IDs from URL
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  // Get current model from selectedAssistant
  const currentModel = selectedAssistant?.model?.model;
  const currentProvider = selectedAssistant?.model?.provider;

  if (!isOpen) return null;

  // Handle model selection
  const handleModelSelect = async (displayName) => {
    if (!selectedAssistant || isSaving) return;

    const modelInfo = modelNameMap[displayName];
    if (!modelInfo) {
      console.error(`❌ Model mapping not found for: ${displayName}`);
      return;
    }

    const newProvider = modelInfo.provider;
    const newModel = modelInfo.api;

    console.log('🎯 Model selected:', {
      displayName,
      newProvider,
      newModel,
      currentProvider,
      currentModel
    });

    // Check if provider changed
    const providerChanged = newProvider !== currentProvider;

    setIsSaving(true);
    setSelectedModel(displayName);

    try {
      // ✅ Build updateData - always include both provider and model
      const updateData = {
        model: {
          provider: newProvider,
          model: newModel
        }
      };

      console.log('📤 Updating assistant model:', {
        subaccountId,
        assistantId,
        updateData,
        providerChanged: providerChanged ? 'Yes - Both changed' : 'No - Only model changed'
      });

      await dispatch(updateAssistant({
        subaccountId,
        assistantId,
        updateData
      })).unwrap();

      console.log('✅ Model updated successfully');
      
      // Close modal after successful update
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('❌ Error updating model:', error);
      alert(`Failed to update model: ${error}`);
    } finally {
      setIsSaving(false);
      setSelectedModel(null);
    }
  };

  // Helper to check if a model is currently active
  const isModelActive = (displayName) => {
    const modelInfo = modelNameMap[displayName];
    if (!modelInfo) return false;
    
    return (
      modelInfo.api === currentModel &&
      modelInfo.provider === currentProvider
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[200] flex justify-center items-start pt-16"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-[850px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-md font-bold text-gray-900">AI Models</h3>
            <p className="text-xs text-gray-500 mt-1">
              Current: {currentProvider} - {currentModel}
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
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
                  <AIModelItem 
                    key={model.name} 
                    {...model}
                    isActive={isModelActive(model.name)}
                    onClick={() => handleModelSelect(model.name)}
                    isSaving={isSaving && selectedModel === model.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                Updating model...
              </span>
            ) : (
              'Click any model to switch'
            )}
          </div>
          <button 
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};