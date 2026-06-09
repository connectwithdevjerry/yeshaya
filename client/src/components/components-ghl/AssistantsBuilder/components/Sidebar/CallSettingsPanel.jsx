import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Info, ChevronDown, Check, AlertCircle, Send } from "lucide-react";
import { updateAssistant } from "../../../../../store/slices/assistantsSlice";
import {
  getSubaccountIdFromUrl,
  getAssistantIdFromUrl,
} from "../../../../../utils/urlUtils";

const BACKGROUND_NOISE_OPTIONS = [
  { value: "off", label: "None (Clear Voice)" },
  { value: "office", label: "Busy Office" },
  { value: "coffee_shop", label: "Coffee Shop" },
  { value: "street", label: "City Street" },
  { value: "rain", label: "Soft Rain" },
  { value: "white_noise", label: "White Noise" },
];

const RULES_OF_ENGAGEMENT_OPTIONS = [
  { value: "assistant_first", label: "AI Initiates (Dynamic Greeting)" },
  { value: "human_first", label: "Human Initiates (Wait for User)" },
  { value: "instant", label: "Instant Connect (No Greeting)" },
];

const SettingInput = ({
  label,
  name,
  value,
  onChange,
  unit,
  description,
  isDropdown = false,
  type = "text",
  options = [],
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Info
        className="w-4 h-4 text-gray-400 cursor-pointer"
        title={description}
      />
    </div>
    <div className="relative">
      {isDropdown ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm appearance-none pr-8 bg-white"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 text-sm"
        />
      )}

      {unit && !isDropdown && (
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
          {unit}
        </span>
      )}

      {isDropdown && (
        <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
      )}
    </div>
  </div>
);

// Reusable component for a toggle switch setting
const ToggleSetting = ({
  label,
  name,
  description,
  buttonText,
  isEnabled,
  onToggle,
  buttonColorClass,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Info
        className="w-4 h-4 text-gray-400 cursor-pointer"
        title={description}
      />
    </div>

    <button
      className={`w-full py-2 text-[10px] font-bold rounded-md ${isEnabled ? buttonColorClass : "bg-gray-100 text-gray-500"} transition-colors duration-150`}
    >
      {isEnabled ? buttonText : "DISABLED"}
    </button>

    <div className="flex justify-end pt-1">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={isEnabled}
          onChange={onToggle}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  </div>
);

export const CallSettingsPanel = () => {
  const dispatch = useDispatch();
  const { selectedAssistant } = useSelector((state) => state.assistants);
  const [searchParams] = useSearchParams();

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  const [settings, setSettings] = useState({
    recordingOptOut: false,
    maxCallTime: 30,
    silenceTimeout: 15000,
    backgroundNoise: "coffee_shop",
    noiseLevel: 70,
    rulesOfEngagement: "assistant_first",
    voicemailDetection: true,
    serverUrl: "",
  });

  const [saveStatus, setSaveStatus] = useState("");
  const saveTimeoutRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (selectedAssistant) {
      setSettings({
        recordingOptOut: selectedAssistant.metadata?.recordingOptOut || false,
        maxCallTime: selectedAssistant.metadata?.maxCallTimeMinutes || 30,
        silenceTimeout:
          selectedAssistant.metadata?.silenceTimeoutSeconds || 15000,
        backgroundNoise:
          selectedAssistant.metadata?.backgroundNoise || "coffee_shop",
        noiseLevel: selectedAssistant.metadata?.noiseLevel || 70,
        rulesOfEngagement:
          selectedAssistant.metadata?.rulesOfEngagement || "assistant_first",
        voicemailDetection:
          selectedAssistant.metadata?.voicemailDetection ?? true,
        serverUrl: selectedAssistant.server?.url || "",
      });
      initialLoadRef.current = false;
    }
  }, [selectedAssistant]);

  const autoSave = useCallback(
    async (updatedSettings) => {
      if (!subaccountId || !assistantId || initialLoadRef.current) return;

      setSaveStatus("saving");

      try {
        const updateData = {
          // ✅ Don't touch model at all if you're only updating metadata
          metadata: {
            ...selectedAssistant.metadata, // ✅ Preserve existing metadata
            recordingOptOut: updatedSettings.recordingOptOut,
            maxCallTimeMinutes: updatedSettings.maxCallTime,
            silenceTimeoutSeconds: updatedSettings.silenceTimeout,
            backgroundNoise: updatedSettings.backgroundNoise,
            noiseLevel: updatedSettings.noiseLevel,
            rulesOfEngagement: updatedSettings.rulesOfEngagement,
            voicemailDetection: updatedSettings.voicemailDetection,
          },
          server: {
            ...selectedAssistant.server, // ✅ Preserve existing server config
            url: updatedSettings.serverUrl,
          },
        };
        await dispatch(updateAssistant({ subaccountId, assistantId, updateData })).unwrap();
        setSaveStatus("success");

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setSaveStatus(""), 2000);
      } catch (error) {
        console.error('Error:', error);
      }
    },
    [dispatch, subaccountId, assistantId, selectedAssistant],
  );

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue =
      type === "number" || type === "range" ? parseFloat(value) : value;

    const updatedSettings = { ...settings, [name]: parsedValue };
    setSettings(updatedSettings);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => autoSave(updatedSettings),
      1000,
    );
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    const updatedSettings = { ...settings, [name]: checked };
    setSettings(updatedSettings);
    autoSave(updatedSettings);
  };

  return (
    <div className="p-4 space-y-5">
      <div className="border-b border-gray-200 pb-4 flex justify-between items-center">
        <div>
          <h5 className="text-sm font-semibold text-gray-800">Call Settings</h5>
          <p className="text-[11px] text-gray-500">
            Configure behavioral settings for voice calls.
          </p>
        </div>
        {saveStatus && (
          <div className="flex items-center gap-1">
            {saveStatus === "saving" && (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            )}
            {saveStatus === "success" && (
              <Check className="w-3 h-3 text-green-600" />
            )}
            {saveStatus === "error" && (
              <AlertCircle className="w-3 h-3 text-red-600" />
            )}
          </div>
        )}
      </div>

      <ToggleSetting
        label="Opt-Out Of Recording & Transcript"
        name="recordingOptOut"
        buttonText="RECORDING ENABLED"
        buttonColorClass="bg-green-100 text-green-800"
        isEnabled={!settings.recordingOptOut}
        onToggle={(e) =>
          handleToggleChange({
            target: { name: "recordingOptOut", checked: e.target.checked },
          })
        }
        description="Use this if you require HIPAA regulation. Data will not be stored."
      />

      <SettingInput
        label="Max Call Time (minutes)"
        name="maxCallTime"
        value={settings.maxCallTime}
        onChange={handleInputChange}
        type="number"
        unit="min"
        description="Maximum length of a call."
      />

      <SettingInput
        label="Silence Timeout (seconds)"
        name="silenceTimeout"
        value={settings.silenceTimeout}
        onChange={handleInputChange}
        type="number"
        unit="ms"
        description="Wait time before ending call due to silence."
      />

      <div className="space-y-2">
        <SettingInput
          label="Background Noise"
          name="backgroundNoise"
          value={settings.backgroundNoise}
          onChange={handleInputChange}
          isDropdown={true}
          options={BACKGROUND_NOISE_OPTIONS}
          description="Select a background noise profile to enhance realism."
        />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase">
            Volume
          </span>
          <input
            type="range"
            name="noiseLevel"
            min="0"
            max="100"
            value={settings.noiseLevel}
            onChange={handleInputChange}
            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-mono text-gray-500 w-8">
            {settings.noiseLevel}%
          </span>
        </div>
      </div>

      <SettingInput
        label="Rules of Engagement"
        name="rulesOfEngagement"
        value={settings.rulesOfEngagement}
        onChange={handleInputChange}
        isDropdown={true}
        options={RULES_OF_ENGAGEMENT_OPTIONS}
        description="Control who starts the call and how the AI greets the user."
      />

      <ToggleSetting
        label="Enable Voicemail Detection"
        name="voicemailDetection"
        buttonText="VOICEMAIL DETECTION ON"
        buttonColorClass="bg-green-100 text-green-800"
        isEnabled={settings.voicemailDetection}
        onToggle={handleToggleChange}
        description="Allows the assistant to detect voicemail and leave a message."
      />

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Server Webhook URL
          </label>
          <Info
            className="w-4 h-4 text-gray-400 cursor-pointer"
            title="URL for call events."
          />
        </div>
        <div className="relative">
          <input
            type="text"
            name="serverUrl"
            value={settings.serverUrl}
            onChange={handleInputChange}
            placeholder="https://api.yourdomain.com/webhook"
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm pr-8"
          />
          <Send className="w-3 h-3 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
    </div>
  );
};
