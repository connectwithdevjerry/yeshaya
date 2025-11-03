// src/components/assistant/ChatSettingsPanel.jsx
import React from 'react';
import { Info } from 'lucide-react';

// Reusable component for a single setting input field
const SettingInput = ({ label, value, unit, description }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" title={description} />
        </div>
        <div className="relative">
            <input
                type="text"
                value={value}
                readOnly
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
            {unit && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">{unit}</span>}
        </div>
    </div>
);

// Reusable component for a toggle switch setting
const ToggleSetting = ({ label, description }) => (
    <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" title={description} />
        </div>
        
        {/* Simple Toggle (based on image) */}
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);

// Reusable component for Response Channels buttons
const ResponseChannelButton = ({ label, isActive }) => (
    <button
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
    return (
        <div className="p-4 space-y-5">
            <div className="border-b border-gray-200 pb-4">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Chat Settings</h5>
                <p className="text-xs text-gray-500">
                    Configure settings for your autopilot mode by setting maximum messages a conversation can process, sleep times and more.
                </p>
            </div>
            
            <SettingInput
                label="Wait Time (seconds)"
                value="15"
                unit="seconds"
                description="The time the bot waits before responding."
            />
            
            <SettingInput
                label="Max Responses"
                value="50"
                description="The maximum number of messages the bot can send in one conversation."
            />
            
            <SettingInput
                label="Temperature"
                value="0.35"
                description="Controls the randomness of the model's output."
            />
            
            <ToggleSetting
                label="Sleep Mode (minutes)"
                description="Enable sleep mode to pause the bot after inactivity."
            />
            
            <ToggleSetting
                label="Enable Purposeful Misspellings"
                description="Add intentional typos for a more human-like communication style."
            />

            <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Response Channels</span>
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" title="Select the channels this assistant can respond on." />
                </div>
                <div className="flex flex-wrap gap-2">
                    <ResponseChannelButton label="SMS" isActive={true} />
                    <ResponseChannelButton label="Email" isActive={true} />
                    <ResponseChannelButton label="WhatsApp" isActive={false} />
                    <ResponseChannelButton label="Instagram" isActive={false} />
                    <ResponseChannelButton label="Facebook" isActive={false} />
                    <ResponseChannelButton label="3rd Party" isActive={false} />
                    <ResponseChannelButton label="Live Chat" isActive={true} />
                </div>
            </div>
        </div>
    );
};