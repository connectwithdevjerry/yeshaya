// src/components/assistant/Sidebar/CallSettingsPanel.jsx
import React from 'react';
import { Info, ChevronDown } from 'lucide-react';

// Reusable component for a single setting input field
const SettingInput = ({ label, value, unit, description, isDropdown = false }) => (
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
                className={`w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 ${isDropdown ? 'appearance-none pr-8' : ''}`}
            />
            {unit && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">{unit}</span>}
            {isDropdown && <ChevronDown className="w-4 h-4 text-gray-500 absolute right-2 top-1/2 transform -translate-y-1/2" />}
        </div>
    </div>
);

// Reusable component for a toggle switch setting (now includes buttons shown in the image)
const ToggleSetting = ({ label, description, buttonText, isEnabled = false, buttonColorClass = 'bg-green-100 text-green-800' }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" title={description} />
        </div>

        {/* Button */}
        <button className={`w-full py-2 text-xs font-semibold rounded-md ${buttonColorClass} transition-colors duration-150`}>
            {buttonText}
        </button>

        {/* Toggle Switch */}
        <div className="flex justify-end pt-1">
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={isEnabled} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
        </div>
    </div>
);


export const CallSettingsPanel = () => {
    return (
        <div className="p-4 space-y-5">
            <div className="border-b border-gray-200 pb-4">
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Call Settings</h5>
                <p className="text-xs text-gray-500">
                    Configure settings for your assistant when calling such as who should initiate the comm, where to send your data, and more.
                </p>
            </div>
            
            {/* Opt-Out of Recording & Transcript */}
            <ToggleSetting
                label="Opt-Out Of Recording & Transcript"
                buttonText="RECORDING ENABLED"
                buttonColorClass='bg-green-100 text-green-800'
                description="This will overwrite call recording and transcripts and that data will be lost - Use this if you require HIPAA or conversation regulation"
                isEnabled={false}
            />
            
            <SettingInput
                label="Max Call Time (minutes)"
                value="30"
                unit="minutes"
                description="Maximum length of a call."
            />
            
            <SettingInput
                label="Silence Timeout (minutes)"
                value="15,000"
                unit="minutes"
                description="How long the assistant waits for a response before ending the call."
            />

            {/* Background Noise & Volume (Dropdown style) */}
            <SettingInput
                label="Background Noise & Volume"
                value="Coffee Shop"
                description="Select a background noise profile."
                isDropdown={true}
            />
            {/* Simple slider underneath, matching the image */}
            <input type="range" min="0" max="100" defaultValue="70" className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
            
            {/* Rules of Engagement (Dropdown style) */}
            <SettingInput
                label="Rules of Engagement"
                value="AI initiates: AI begins the conversation with a dynamic message"
                description="Control who starts the call."
                isDropdown={true}
            />

            {/* Enable Voicemail Detection & Message */}
            <ToggleSetting
                label="Enable Voicemail Detection & Message"
                buttonText="VOICEMAIL DETECTION ON"
                buttonColorClass='bg-green-100 text-green-800'
                description="Allows the assistant to detect voicemail and leave a message."
                isEnabled={true}
            />
            
            {/* Incoming Call Webhook (Webhook URL Input) */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Incoming Call Webhook</label>
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" title="URL to send data on incoming calls." />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder=""
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </span>
                </div>
            </div>

            {/* Post-Call Webhook (Webhook URL Input) */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Post-Call Webhook</label>
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer" title="URL to send data after the call ends." />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder=""
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </span>
                </div>
            </div>

        </div>
    );
};