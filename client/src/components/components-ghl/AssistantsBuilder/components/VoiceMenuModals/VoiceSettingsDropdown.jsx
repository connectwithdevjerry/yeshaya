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
    engine: "default",
    responseSpeed: 1,
    interruptionSensitivity: 1,
    talkSpeed: 0.92,
  });

  const [saveStatus, setSaveStatus] = useState(""); // 'saving', 'success', 'error'
  const [saveMessage, setSaveMessage] = useState("");
  const saveTimeoutRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync state with selected assistant data
  useEffect(() => {
    if (selectedAssistant?.voice?.settings) {
      const s = selectedAssistant.voice.settings;
      setSettings({
        engine: s.engine || "default",
        responseSpeed: s.responseSpeed ?? 1,
        interruptionSensitivity: s.interruptionSensitivity ?? 1,
        talkSpeed: s.talkSpeed ?? 0.92,
      });
    }
  }, [selectedAssistant]);

  const autoSave = useCallback(
    async (updatedSettings) => {
      if (!subaccountId || !assistantId || !selectedAssistant?.voice) {
        console.warn("Auto-save aborted: Missing IDs or Voice object.", {
          subaccountId,
          assistantId,
        });
        return;
      }

      setSaveStatus("saving");
      setSaveMessage("Saving...");

      const updateData = {
        voice: {
          provider: selectedAssistant.voice.provider,
          voiceId: selectedAssistant.voice.voiceId,
          // Move settings up one level
          engine: updatedSettings.engine,
          responseSpeed: updatedSettings.responseSpeed,
          interruptionSensitivity: updatedSettings.interruptionSensitivity,
          talkSpeed: updatedSettings.talkSpeed,
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
        // Improved error extraction: tries to get the specific message from the server response
        const errorMessage =
          error?.response?.data?.message || error?.message || "Unknown error";

        console.error("❌ Voice Update Failed:", {
          serverMessage: errorMessage,
          errorObject: error,
          payloadSent: updateData,
        });

        setSaveStatus("error");
        setSaveMessage(errorMessage.length > 20 ? "Save failed" : errorMessage);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          setSaveStatus("");
          setSaveMessage("");
        }, 4000);
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

  const handleEngineChange = (e) => {
    const updatedSettings = { ...settings, engine: e.target.value };
    setSettings(updatedSettings);
    autoSave(updatedSettings); // Engine changes save immediately
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800">Voice Settings</h3>
          {saveStatus && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded transition-all duration-300 ${
                saveStatus === "success"
                  ? "bg-green-100 text-green-700"
                  : saveStatus === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {saveMessage}
            </span>
          )}
        </div>
        <X
          size={18}
          className="text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={onClose}
        />
      </div>

      <div className="space-y-6">
        {/* Voice Engine Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase flex items-center gap-1">
            Voice Engine <Info size={12} className="text-gray-400" />
          </label>
          <select
            value={settings.engine}
            onChange={handleEngineChange}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            {selectedAssistant?.voice?.provider === "elevenlabs" && (
              <>
                <option value="eleven_turbo_v2">ElevenLabs Turbo v2</option>
                <option value="eleven_multilingual_v2">
                  ElevenLabs Multilingual v2
                </option>
              </>
            )}
          </select>
        </div>

        {/* Response Speed */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Response Speed
            </label>
            <span className="text-xs font-mono text-blue-600">
              {settings.responseSpeed.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            name="responseSpeed"
            min="0"
            max="1"
            step="0.1"
            value={settings.responseSpeed}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Interruption Sensitivity */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Interruption Sensitivity
            </label>
            <span className="text-xs font-mono text-blue-600">
              {settings.interruptionSensitivity.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            name="interruptionSensitivity"
            min="0"
            max="1"
            step="0.1"
            value={settings.interruptionSensitivity}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Talk Speed */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-bold text-gray-600 uppercase">
              Talk Speed
            </label>
            <span className="text-xs font-mono text-blue-600">
              {settings.talkSpeed.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            name="talkSpeed"
            min="0.5"
            max="2"
            step="0.01"
            value={settings.talkSpeed}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none accent-blue-600 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
