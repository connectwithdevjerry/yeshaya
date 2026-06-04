// src/components/assistant/ChatSettingsPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Info, Check, AlertCircle, Loader2 } from "lucide-react";
import { updateAssistant } from "../../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

// ── Shared input ────────────────────────────────────────────────────────────
const SettingInput = ({ label, value, onChange, unit, description, name, type = "text" }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer" title={description} />
    </div>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        step={name === "temperature" ? "0.01" : "1"}
        min={name === "temperature" ? "0" : "0"}
        max={name === "temperature" ? "2" : undefined}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300"
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// ── Toggle ──────────────────────────────────────────────────────────────────
const ToggleSetting = ({ label, description, checked, onChange, name }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Info className="w-3.5 h-3.5 text-gray-300 cursor-pointer flex-shrink-0" title={description} />
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/30
        peer-checked:bg-indigo-500
        after:content-[''] after:absolute after:top-[2px] after:left-[2px]
        after:bg-white after:border after:border-gray-300 after:rounded-full
        after:h-4 after:w-4 after:transition-all
        peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </label>
  </div>
);

// ── Channel pill ─────────────────────────────────────────────────────────────
const ChannelPill = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
      isActive
        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
        : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

// ── Save indicator ───────────────────────────────────────────────────────────
const SaveIndicator = ({ status, message }) => {
  if (!status) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      {status === "saving"  && <><Loader2  className="w-3 h-3 animate-spin text-indigo-500" /><span className="text-indigo-500">{message}</span></>}
      {status === "success" && <><Check    className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">{message}</span></>}
      {status === "error"   && <><AlertCircle className="w-3 h-3 text-rose-500" /><span className="text-rose-500">{message}</span></>}
    </div>
  );
};

// ── Panel ────────────────────────────────────────────────────────────────────
export const ChatSettingsPanel = () => {
  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const { selectedAssistant } = useSelector((s) => s.assistants);

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [settings, setSettings] = useState({
    maxTokens:         150,
    temperature:       0.3,
    waitTime:          15,
    sleepMode:         false,
    sleepModeMinutes:  30,
    enableMisspellings: false,
    responseChannels: {
      sms: true, email: true, whatsapp: false,
      instagram: false, facebook: false, thirdParty: false, liveChat: true,
    },
  });

  const [saveStatus,  setSaveStatus]  = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const saveTimeoutRef  = useRef(null);
  const debounceTimerRef = useRef(null);
  const initialLoadRef  = useRef(true);

  useEffect(() => {
    if (selectedAssistant) {
      setSettings({
        maxTokens:          selectedAssistant.model?.maxTokens          || 150,
        temperature:        selectedAssistant.model?.temperature        || 0.3,
        waitTime:           selectedAssistant.metadata?.waitTimeSeconds  || 15,
        sleepMode:          selectedAssistant.metadata?.sleepMode        || false,
        sleepModeMinutes:   selectedAssistant.metadata?.sleepModeMinutes || 30,
        enableMisspellings: selectedAssistant.metadata?.enableMisspellings || false,
        responseChannels:   selectedAssistant.metadata?.responseChannels || {
          sms: true, email: true, whatsapp: false,
          instagram: false, facebook: false, thirdParty: false, liveChat: true,
        },
      });
      initialLoadRef.current = false;
    }
  }, [selectedAssistant]);

  const autoSave = useCallback(async (updated) => {
    if (!subaccountId || !assistantId || initialLoadRef.current || !selectedAssistant?.model) return;
    setSaveStatus("saving"); setSaveMessage("Saving…");
    try {
      await dispatch(updateAssistant({
        subaccountId, assistantId,
        updateData: {
          model:    { ...selectedAssistant.model,    temperature: updated.temperature, maxTokens: updated.maxTokens },
          metadata: { ...selectedAssistant.metadata, waitTimeSeconds: updated.waitTime, sleepMode: updated.sleepMode,
            sleepModeMinutes: updated.sleepModeMinutes, enableMisspellings: updated.enableMisspellings,
            responseChannels: updated.responseChannels },
        },
      })).unwrap();
      setSaveStatus("success"); setSaveMessage("Saved");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => { setSaveStatus(""); setSaveMessage(""); }, 2000);
    } catch (err) {
      setSaveStatus("error"); setSaveMessage(`Error: ${err}`);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => { setSaveStatus(""); setSaveMessage(""); }, 5000);
    }
  }, [dispatch, subaccountId, assistantId, selectedAssistant]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsed = type === "number" ? parseFloat(value) || 0 : value;
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

  const handleChannelToggle = (channel) => {
    const updated = { ...settings, responseChannels: { ...settings.responseChannels, [channel]: !settings.responseChannels[channel] } };
    setSettings(updated);
    autoSave(updated);
  };

  useEffect(() => () => {
    clearTimeout(debounceTimerRef.current);
    clearTimeout(saveTimeoutRef.current);
  }, []);

  return (
    <div className="p-4 space-y-5">
      {/* Section header */}
      <div className="flex items-start justify-between pb-3 border-b border-gray-100">
        <div>
          <p className="text-xs font-bold text-gray-700">Chat Settings</p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
            Configure autopilot behaviour — tokens, wait times, sleep mode and channels.
          </p>
        </div>
        <SaveIndicator status={saveStatus} message={saveMessage} />
      </div>

      <SettingInput label="Wait Time" name="waitTime" value={settings.waitTime}
        onChange={handleInputChange} type="number" unit="sec"
        description="How long the bot waits before responding." />

      <SettingInput label="Max Tokens" name="maxTokens" value={settings.maxTokens}
        onChange={handleInputChange} type="number"
        description="Maximum tokens the model can generate per response." />

      <SettingInput label="Temperature" name="temperature" value={settings.temperature}
        onChange={handleInputChange} type="number"
        description="Controls randomness (0–2). Lower = more focused, higher = more creative." />

      <div className="border-t border-gray-100 pt-4 space-y-3">
        <ToggleSetting label="Sleep Mode" name="sleepMode" checked={settings.sleepMode}
          onChange={handleToggleChange}
          description="Pause the bot after a period of inactivity." />

        {settings.sleepMode && (
          <SettingInput label="Sleep Duration" name="sleepModeMinutes" value={settings.sleepModeMinutes}
            onChange={handleInputChange} type="number" unit="min"
            description="How many minutes before sleep mode kicks in." />
        )}

        <ToggleSetting label="Purposeful Misspellings" name="enableMisspellings" checked={settings.enableMisspellings}
          onChange={handleToggleChange}
          description="Add intentional typos for a more human-like style." />
      </div>

      {/* Response channels */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Response Channels</span>
          <Info className="w-3.5 h-3.5 text-gray-300" title="Channels this assistant can respond on." />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(settings.responseChannels).map((ch) => (
            <ChannelPill
              key={ch}
              label={ch.charAt(0).toUpperCase() + ch.slice(1).replace(/([A-Z])/g, " $1").trim()}
              isActive={settings.responseChannels[ch]}
              onClick={() => handleChannelToggle(ch)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
