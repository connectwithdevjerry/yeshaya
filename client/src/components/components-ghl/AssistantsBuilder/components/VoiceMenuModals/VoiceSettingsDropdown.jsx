import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { X, Info } from "lucide-react";
import { updateAssistant } from "../../../../../store/slices/assistantsSlice";
import {
  getSubaccountIdFromUrl,
  getAssistantIdFromUrl,
} from "../../../../../utils/urlUtils";

export const VoiceSettingsDropdown = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [searchParams] = useSearchParams();

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  const [settings, setSettings] = useState({
    model: "tts-1", // OpenAI default
    speed: 1,
    fillerInjectionEnabled: true,
  });

  const [saveStatus, setSaveStatus] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const saveTimeoutRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (selectedAssistant?.voice) {
      const v = selectedAssistant.voice;
      setSettings({
        model: v.model || "tts-1",
        speed: v.speed ?? 1,
        fillerInjectionEnabled: v.fillerInjectionEnabled ?? true,
      });
    }
  }, [selectedAssistant]);

  const autoSave = useCallback(
    async (updatedSettings) => {
      if (!subaccountId || !assistantId || !selectedAssistant?.voice) return;

      setSaveStatus("saving");
      setSaveMessage("Saving...");

      // OpenAI-specific structure for Vapi
      const updateData = {
        voice: {
          provider: "openai",
          voiceId: selectedAssistant.voice.voiceId || "shimmer",
          model: updatedSettings.model,
          speed: updatedSettings.speed,
          fillerInjectionEnabled: updatedSettings.fillerInjectionEnabled,
        },
      };

      try {
        await dispatch(
          updateAssistant({ subaccountId, assistantId, updateData }),
        ).unwrap();

        setSaveStatus("success");
        setSaveMessage("Saved");

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          setSaveStatus("");
          setSaveMessage("");
        }, 2000);
      } catch (error) {
        const errorMessage = error?.response?.data?.message || "Save failed";
        setSaveStatus("error");
        setSaveMessage(typeof errorMessage === 'string' ? errorMessage : "Error");
      }
    },
    [dispatch, subaccountId, assistantId, selectedAssistant],
  );

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);
    const updatedSettings = { ...settings, [name]: parsedValue };
    setSettings(updatedSettings);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => autoSave(updatedSettings), 800);
  };

  const handleToggleChange = (e) => {
    const updatedSettings = { ...settings, fillerInjectionEnabled: e.target.checked };
    setSettings(updatedSettings);
    autoSave(updatedSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800">Voice Settings</h3>
          {saveStatus && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded transition-all duration-300 ${
              saveStatus === "success" ? "bg-green-100 text-green-700" : 
              saveStatus === "error" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}>
              {saveMessage}
            </span>
          )}
        </div>
        <X size={18} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
      </div>

      <div className="space-y-6">
        {/* Voice Model Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
            Voice Model <Info size={12} title="TTS-1 is optimized for speed/latency." className="text-gray-400" />
          </label>
          <select
            name="model"
            value={settings.model}
            onChange={(e) => {
              const updated = { ...settings, model: e.target.value };
              setSettings(updated);
              autoSave(updated);
            }}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="tts-1">OpenAI TTS 1 (Fast)</option>
            <option value="tts-1-hd">OpenAI TTS 1 HD (High Quality)</option>
          </select>
          <p className="text-[10px] text-gray-500 italic">Determines the synthesis quality and response latency.</p>
        </div>

        {/* Talk Speed */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-bold text-gray-600 uppercase">Talk Speed</label>
            <span className="text-xs font-mono text-blue-600">{settings.speed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            name="speed"
            min="0.25"
            max="4.0"
            step="0.05"
            value={settings.speed}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-blue-600 cursor-pointer"
          />
          <p className="text-[10px] text-gray-500 italic">Adjusts how fast Mercy speaks. 1.0 is standard human speed.</p>
        </div>

        {/* Filler Injection */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase block">Inject Fillers</label>
            <p className="text-[10px] text-gray-500 italic max-w-[180px]">Adds natural "ums" and "uhs" to sound more human.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.fillerInjectionEnabled}
            onChange={handleToggleChange}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};