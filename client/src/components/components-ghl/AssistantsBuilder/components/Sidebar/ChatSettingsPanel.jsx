// src/components/assistant/ChatSettingsPanel.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Info, Check, AlertCircle } from 'lucide-react';
import { updateAssistant } from '../../../../../store/slices/assistantsSlice';
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from '../../../../../utils/urlUtils';

// Reusable component for a single setting input field
const SettingInput = ({ label, value, onChange, unit, description, name, type = "text" }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" title={description} />
        </div>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                step={name === 'temperature' ? '0.01' : '1'}
                min={name === 'temperature' ? '0' : '0'}
                max={name === 'temperature' ? '2' : undefined}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
            {unit && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">{unit}</span>}
        </div>
    </div>
);

// Reusable component for a toggle switch setting
const ToggleSetting = ({ label, description, checked, onChange, name }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" title={description} />
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                name={name}
                checked={checked}
                onChange={onChange}
                className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);

// Reusable component for Response Channels buttons
const ResponseChannelButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 
            ${isActive 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
    >
        {label}
    </button>
);

export const ChatSettingsPanel = () => {
    const dispatch = useDispatch();
    const { selectedAssistant, loading } = useSelector((state) => state.assistants);
    const [searchParams] = useSearchParams();
    
    // ✅ Extract subaccountId and assistantId from URL using utility functions
    const subaccountId = getSubaccountIdFromUrl(searchParams);
    const assistantId = getAssistantIdFromUrl(searchParams);

    // Local state for form fields
    const [settings, setSettings] = useState({
        // Model fields
        maxTokens: 50,
        temperature: 0.35,
        
        // Metadata fields
        waitTime: 15,
        sleepMode: false,
        sleepModeMinutes: 30,
        enableMisspellings: false,
        responseChannels: {
            sms: true,
            email: true,
            whatsapp: false,
            instagram: false,
            facebook: false,
            thirdParty: false,
            liveChat: true
        }
    });

    const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'success', 'error'
    const [saveMessage, setSaveMessage] = useState('');
    const saveTimeoutRef = useRef(null);
    const initialLoadRef = useRef(true);

    // ✅ Load settings from selectedAssistant when available
    useEffect(() => {
        if (selectedAssistant) {
            console.log('📥 Loading assistant data into Chat Settings:', selectedAssistant);
            
            setSettings({
                // ✅ From model object
                maxTokens: selectedAssistant.model?.maxTokens || 150,
                temperature: selectedAssistant.model?.temperature || 0.3,
                
                // ✅ From metadata object
                waitTime: selectedAssistant.metadata?.waitTimeSeconds || 15,
                sleepMode: selectedAssistant.metadata?.sleepMode || false,
                sleepModeMinutes: selectedAssistant.metadata?.sleepModeMinutes || 30,
                enableMisspellings: selectedAssistant.metadata?.enableMisspellings || false,
                responseChannels: selectedAssistant.metadata?.responseChannels || {
                    sms: true,
                    email: true,
                    whatsapp: false,
                    instagram: false,
                    facebook: false,
                    thirdParty: false,
                    liveChat: true
                }
            });
            
            // Mark initial load as complete after first load
            initialLoadRef.current = false;
        }
    }, [selectedAssistant]);

    // ✅ Auto-save function - sends ALL settings together
    const autoSave = useCallback(async (updatedSettings) => {
        if (!subaccountId || !assistantId) {
            setSaveStatus('error');
            setSaveMessage('Missing subaccount or assistant ID');
            console.error('❌ Cannot save: Missing IDs', { subaccountId, assistantId });
            return;
        }

        // Skip auto-save on initial load
        if (initialLoadRef.current) {
            console.log('⏭️ Skipping auto-save on initial load');
            return;
        }

        if (!selectedAssistant?.model) {
            console.error('❌ Cannot save: No model data available');
            return;
        }

        // setSaveStatus('saving');
        // setSaveMessage('Saving...');
        console.log('💾 Auto-saving all settings:', updatedSettings);

        try {
            // ✅ Get original provider and model from selectedAssistant
            const originalProvider = selectedAssistant.model.provider;
            const originalModel = selectedAssistant.model.model;

            // ✅ Build complete updateData with ALL settings
            const updateData = {
                model: {
                    provider: originalProvider,
                    model: originalModel,
                    temperature: updatedSettings.temperature,
                    maxTokens: updatedSettings.maxTokens
                },
                metadata: {
                    waitTimeSeconds: updatedSettings.waitTime,
                    sleepMode: updatedSettings.sleepMode,
                    sleepModeMinutes: updatedSettings.sleepModeMinutes,
                    enableMisspellings: updatedSettings.enableMisspellings,
                    responseChannels: updatedSettings.responseChannels
                }
            };

            console.log('📤 Sending complete settings update:', {
                subaccountId,
                assistantId,
                updateData
            });

            await dispatch(updateAssistant({
                subaccountId,
                assistantId,
                updateData
            })).unwrap();

            setSaveStatus('success');
            setSaveMessage('Saved');
            console.log('✅ All settings saved successfully');
            
            // Clear success message after 2 seconds
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                setSaveStatus('');
                setSaveMessage('');
            }, 2000);
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            setSaveStatus('error');
            setSaveMessage(`Error: ${error}`);
            
            // Clear error message after 5 seconds
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                setSaveStatus('');
                setSaveMessage('');
            }, 5000);
        }
    }, [dispatch, subaccountId, assistantId, selectedAssistant]);

    // Debounce timer for input changes
    const debounceTimerRef = useRef(null);

    // Handle input changes with debounced auto-save
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
        
        // Update local state immediately
        const updatedSettings = {
            ...settings,
            [name]: parsedValue
        };
        setSettings(updatedSettings);

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // ✅ Set new timer for auto-save - saves ALL settings
        debounceTimerRef.current = setTimeout(() => {
            autoSave(updatedSettings);
        }, 1000);
    };

    // Handle toggle changes with immediate auto-save
    const handleToggleChange = (e) => {
        const { name, checked } = e.target;
        
        // Update local state immediately
        const updatedSettings = {
            ...settings,
            [name]: checked
        };
        setSettings(updatedSettings);
        
        // ✅ Save immediately for toggles - ALL settings
        autoSave(updatedSettings);
    };

    // Handle response channel toggle with immediate auto-save
    const handleChannelToggle = (channel) => {
        const updatedChannels = {
            ...settings.responseChannels,
            [channel]: !settings.responseChannels[channel]
        };
        
        // Update local state immediately
        const updatedSettings = {
            ...settings,
            responseChannels: updatedChannels
        };
        setSettings(updatedSettings);
        
        // ✅ Save immediately - ALL settings
        autoSave(updatedSettings);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="p-4 space-y-5">
            <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h5 className="text-sm font-semibold text-gray-800 mb-2">Chat Settings</h5>
                        <p className="text-xs text-gray-500">
                            Configure settings for your autopilot mode by setting maximum messages a conversation can process, sleep times and more.
                        </p>
                    </div>
                    
                    {/* Save Status Indicator */}
                    {saveStatus && (
                        <div className="flex items-center gap-1 text-xs">
                            {saveStatus === 'saving' && (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                    <span className="text-blue-600">{saveMessage}</span>
                                </>
                            )}
                            {saveStatus === 'success' && (
                                <>
                                    <Check className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600">{saveMessage}</span>
                                </>
                            )}
                            {saveStatus === 'error' && (
                                <>
                                    <AlertCircle className="w-3 h-3 text-red-600" />
                                    <span className="text-red-600">{saveMessage}</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <SettingInput
                label="Wait Time (seconds)"
                name="waitTime"
                value={settings.waitTime}
                onChange={handleInputChange}
                type="number"
                unit="seconds"
                description="The time the bot waits before responding."
            />
            
            {/* ✅ Changed label to match API field name */}
            <SettingInput
                label="Max Tokens"
                name="maxTokens"
                value={settings.maxTokens}
                onChange={handleInputChange}
                type="number"
                description="The maximum number of tokens the model can generate. From API: maxTokens field."
            />
            
            {/* ✅ Temperature now loads from API (0.3) */}
            <SettingInput
                label="Temperature"
                name="temperature"
                value={settings.temperature}
                onChange={handleInputChange}
                type="number"
                description="Controls the randomness of the model's output (0.0 - 2.0). Lower = more focused, Higher = more creative."
            />
            
            <ToggleSetting
                label="Sleep Mode"
                name="sleepMode"
                checked={settings.sleepMode}
                onChange={handleToggleChange}
                description="Enable sleep mode to pause the bot after inactivity."
            />
            
            {settings.sleepMode && (
                <SettingInput
                    label="Sleep Mode Duration"
                    name="sleepModeMinutes"
                    value={settings.sleepModeMinutes}
                    onChange={handleInputChange}
                    type="number"
                    unit="minutes"
                    description="How long before the bot enters sleep mode."
                />
            )}
            
            <ToggleSetting
                label="Enable Purposeful Misspellings"
                name="enableMisspellings"
                checked={settings.enableMisspellings}
                onChange={handleToggleChange}
                description="Add intentional typos for a more human-like communication style."
            />

            <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Channels</span>
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" title="Select the channels this assistant can respond on." />
                </div>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(settings.responseChannels).map((channel) => (
                        <ResponseChannelButton 
                            key={channel}
                            label={channel.charAt(0).toUpperCase() + channel.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                            isActive={settings.responseChannels[channel]}
                            onClick={() => handleChannelToggle(channel)}
                        />
                    ))}
                </div>
            </div>

            {/* ✅ Debug panel showing current loaded values
            {selectedAssistant && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs font-semibold text-blue-800 mb-2">
                        📊 Current Assistant Settings from API
                    </p>
                    <div className="space-y-1 text-xs text-blue-700">
                        <p><strong>Model Section:</strong></p>
                        <p className="ml-3">• Max Tokens: {settings.maxTokens}</p>
                        <p className="ml-3">• Temperature: {settings.temperature}</p>
                        <p className="ml-3">• Model: {selectedAssistant.model?.model}</p>
                        <p className="ml-3">• Provider: {selectedAssistant.model?.provider}</p>
                        <p className="mt-2"><strong>Metadata Section:</strong></p>
                        <p className="ml-3">• Wait Time: {settings.waitTime}s</p>
                        <p className="ml-3">• Sleep Mode: {settings.sleepMode ? 'ON' : 'OFF'}</p>
                        <p className="ml-3">• Channels: {Object.entries(settings.responseChannels).filter(([_, v]) => v).map(([k]) => k).join(', ')}</p>
                    </div>
                </div>
            )} */}
        </div>
    );
};