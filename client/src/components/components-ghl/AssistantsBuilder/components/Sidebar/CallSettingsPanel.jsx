// src/components/assistant/CallSettingsPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Info, ChevronDown, Check, AlertCircle, Loader2, Send } from "lucide-react";
import { updateAssistant } from "../../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

// Vapi natively supports only "off" and "office" (or a hosted audio URL)
const BACKGROUND_NOISE_OPTIONS = [
  { value: "off",    label: "None (Clear Voice)" },
  { value: "office", label: "Busy Office"        },
];

const RULES_OF_ENGAGEMENT_OPTIONS = [
  { value: "assistant_first", label: "AI Initiates (Speaks First)"     },
  { value: "human_first",     label: "Human Initiates (Wait for User)" },
  { value: "instant",         label: "Instant Connect (No Greeting)"   },
];

// Rules of engagement → Vapi firstMessageMode
const ROE_TO_MODE = {
  assistant_first: "assistant-speaks-first",
  human_first:     "assistant-waits-for-user",
  instant:         "assistant-waits-for-user",
};
const MODE_TO_ROE = (mode) =>
  mode === "assistant-waits-for-user" ? "human_first" : "assistant_first";

// ── Shared input / select ────────────────────────────────────────────────────
const SettingInput = ({ label, name, value, onChange, unit, description, isDropdown = false, type = "text", options = [] }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer" title={description} />
    </div>
    <div className="relative">
      {isDropdown ? (
        <select
          name={name} value={value} onChange={onChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none appearance-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-8"
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={type} name={name} value={value} onChange={onChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      )}
      {unit && !isDropdown && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none">{unit}</span>
      )}
      {isDropdown && (
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}
    </div>
  </div>
);

// ── Toggle with status badge ─────────────────────────────────────────────────
const ToggleSetting = ({ label, name, description, statusText, isEnabled, onToggle }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer" title={description} />
    </div>
    <div className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/60">
      <span className={`text-xs font-bold ${isEnabled ? "text-emerald-600" : "text-gray-400"}`}>
        {isEnabled ? statusText : "DISABLED"}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={isEnabled} onChange={onToggle} className="sr-only peer" />
        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/30
          peer-checked:bg-indigo-500
          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:border after:border-gray-300 after:rounded-full
          after:h-4 after:w-4 after:transition-all
          peer-checked:after:translate-x-full peer-checked:after:border-white" />
      </label>
    </div>
  </div>
);

// ── Save indicator ────────────────────────────────────────────────────────────
const SaveIndicator = ({ status }) => {
  if (!status) return null;
  return (
    <div className="flex items-center gap-1">
      {status === "saving"  && <Loader2    className="w-3 h-3 animate-spin text-indigo-500" />}
      {status === "success" && <Check      className="w-3 h-3 text-emerald-500" />}
      {status === "error"   && <AlertCircle className="w-3 h-3 text-rose-500" />}
    </div>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────────
export const CallSettingsPanel = () => {
  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const { selectedAssistant } = useSelector((s) => s.assistants);

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [settings, setSettings] = useState({
    recordingOptOut:    false,
    maxCallTime:        30,
    silenceTimeout:     30,
    backgroundNoise:    "off",
    noiseLevel:         70,
    rulesOfEngagement:  "assistant_first",
    voicemailDetection: true,
    serverUrl:          "",
  });

  const [saveStatus, setSaveStatus]   = useState("");
  const saveTimeoutRef  = useRef(null);
  const debounceTimerRef = useRef(null);
  const initialLoadRef  = useRef(true);

  useEffect(() => {
    if (selectedAssistant) {
      const a = selectedAssistant;
      setSettings({
        // recording is ON unless artifactPlan explicitly disabled it
        recordingOptOut:    a.artifactPlan?.recordingEnabled === false,
        maxCallTime:        a.maxDurationSeconds ? Math.round(a.maxDurationSeconds / 60) : 30,
        silenceTimeout:     a.silenceTimeoutSeconds || 30,
        backgroundNoise:    a.backgroundSound === "office" ? "office" : "off",
        noiseLevel:         a.metadata?.noiseLevel ?? 70,
        rulesOfEngagement:  MODE_TO_ROE(a.firstMessageMode),
        voicemailDetection: !!a.voicemailDetection,
        serverUrl:          a.server?.url || "",
      });
      initialLoadRef.current = false;
    }
  }, [selectedAssistant]);

  const autoSave = useCallback(async (updated) => {
    if (!subaccountId || !assistantId || initialLoadRef.current) return;
    setSaveStatus("saving");
    try {
      const clampSilence = Math.min(3600, Math.max(10, Number(updated.silenceTimeout) || 30));
      const updateData = {
        maxDurationSeconds:    Math.max(10, (Number(updated.maxCallTime) || 30) * 60),
        silenceTimeoutSeconds: clampSilence,
        backgroundSound:       updated.backgroundNoise === "office" ? "office" : "off",
        firstMessageMode:      ROE_TO_MODE[updated.rulesOfEngagement] || "assistant-speaks-first",
        artifactPlan:          { ...selectedAssistant?.artifactPlan, recordingEnabled: !updated.recordingOptOut },
        server:                { ...selectedAssistant?.server, url: updated.serverUrl },
        // noiseLevel has no native Vapi equivalent — kept as a stored preference
        metadata:              { ...selectedAssistant?.metadata, noiseLevel: updated.noiseLevel },
      };
      // Voicemail detection: enable with Vapi provider, or turn off
      updateData.voicemailDetection = updated.voicemailDetection ? { provider: "vapi" } : null;
      // Instant connect = no greeting
      if (updated.rulesOfEngagement === "instant") updateData.firstMessage = "";

      await dispatch(updateAssistant({ subaccountId, assistantId, updateData })).unwrap();
      setSaveStatus("success");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSaveStatus(""), 4000);
    }
  }, [dispatch, subaccountId, assistantId, selectedAssistant]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsed = type === "number" || type === "range" ? parseFloat(value) : value;
    const updated = { ...settings, [name]: parsed };
    setSettings(updated);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => autoSave(updated), 1000);
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    const updated = { ...settings, [name]: checked };
    setSettings(updated);
    autoSave(updated);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Section header */}
      <div className="flex items-start justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-xs font-bold text-gray-700">Call Settings</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Configure voice call behaviour and limits.</p>
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      <ToggleSetting
        label="Recording & Transcript"
        name="recordingOptOut"
        statusText="RECORDING ENABLED"
        isEnabled={!settings.recordingOptOut}
        onToggle={(e) => handleToggleChange({ target: { name: "recordingOptOut", checked: !e.target.checked } })}
        description="Opt out to comply with HIPAA — data will not be stored."
      />

      <SettingInput label="Max Call Time" name="maxCallTime" value={settings.maxCallTime}
        onChange={handleInputChange} type="number" unit="min"
        description="Maximum length of a call in minutes." />

      <SettingInput label="Silence Timeout" name="silenceTimeout" value={settings.silenceTimeout}
        onChange={handleInputChange} type="number" unit="sec"
        description="Seconds of silence before the call ends (10–3600)." />

      {/* Background noise */}
      <div className="space-y-2">
        <SettingInput label="Background Noise" name="backgroundNoise" value={settings.backgroundNoise}
          onChange={handleInputChange} isDropdown options={BACKGROUND_NOISE_OPTIONS}
          description="Ambient sound played during the call (Vapi supports Off or Office)." />
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase w-14 flex-shrink-0">Volume</span>
          <input
            type="range" name="noiseLevel" min="0" max="100" value={settings.noiseLevel}
            onChange={handleInputChange}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer accent-indigo-500 bg-gray-200"
          />
          <span className="text-xs font-mono text-gray-500 w-8 text-right">{settings.noiseLevel}%</span>
        </div>
      </div>

      <SettingInput label="Rules of Engagement" name="rulesOfEngagement" value={settings.rulesOfEngagement}
        onChange={handleInputChange} isDropdown options={RULES_OF_ENGAGEMENT_OPTIONS}
        description="Control who initiates the call and how the AI greets the user." />

      <ToggleSetting
        label="Voicemail Detection"
        name="voicemailDetection"
        statusText="DETECTION ON"
        isEnabled={settings.voicemailDetection}
        onToggle={handleToggleChange}
        description="Detect voicemail and leave a message automatically." />

      {/* Server webhook */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Server Webhook URL</label>
          <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer" title="URL for call events." />
        </div>
        <div className="relative">
          <input
            type="text" name="serverUrl" value={settings.serverUrl}
            onChange={handleInputChange}
            placeholder="https://api.yourdomain.com/webhook"
            className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300"
          />
          <Send className="w-3 h-3 text-gray-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
