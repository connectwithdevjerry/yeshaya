// src/components/assistant/VoiceLabView.jsx
import React from 'react';
import { Info, Mic } from 'lucide-react';

export const VoiceLabView = () => {
  return (
    <div className="flex flex-col flex-1 h-full bg-white p-6 relative">
      
      {/* Warning/Alert Section */}
      <div className="w-full p-4 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center">
        <span className="font-medium flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Labs do not call tools or book appointments
        </span>
      </div>

      {/* Main Voice Lab Content */}
      <div className="flex-1 flex flex-col space-y-4">
        
        {/* Assistant Status and Start Call Button */}
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 bg-gray-400 rounded-full"></span>
                <span className="text-gray-700">New Blank Assistant</span>
            </div>
            <button className="px-5 py-2 bg-green-500 text-white font-medium rounded-md shadow-sm hover:bg-green-600 transition-colors duration-150">
                Start Call
            </button>
        </div>

        {/* Conversation Area (initial message) */}
        <div className="bg-gray-50 p-4 rounded-lg flex flex-col space-y-4 flex-1 overflow-y-auto">
            {/* AI's initial message */}
            <div className="flex items-start space-x-3">
                <span className="font-semibold text-blue-600">AI</span>
                <p className="text-gray-800">Hello! Click "Start Call" to begin the conversation.</p>
            </div>
            {/* Future messages would go here */}
        </div>

      </div>
    </div>
  );
};