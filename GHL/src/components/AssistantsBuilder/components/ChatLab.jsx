// src/components/assistant/ChatLabView.jsx
import React from 'react';
import { Info, Bot } from 'lucide-react';

export const ChatLabView = () => {
  return (
    <div className="flex flex-col flex-1 h-full bg-white p-6 relative">
      
      {/* Simulation Header/Status Bar */}
      <div className="flex justify-between items-center mb-6 text-sm text-gray-700">
        <span className="font-semibold text-gray-800">
          Test contact ID: 7hJuqiofgovHJH4Ct83x
        </span>
        <div className="flex items-center space-x-3">
          <span className="text-orange-500 bg-orange-50 px-3 py-1 rounded-full text-xs font-medium">
            Simulation Under Construction
          </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Clear conversation
          </button>
          <Info className="w-4 h-4 text-gray-400" title="More Info" />
        </div>
      </div>

      {/* Warning/Alert Section */}
      <div className="w-full p-4 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center">
        <span className="font-medium flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Labs do not call tools or book appointments
        </span>
      </div>

      {/* Main Empty State/Message Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Bot className="w-12 h-12 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-800">
          Chat Lab
        </h3>
        <p className="text-sm text-gray-500 text-center">
          This model has access to a test contact in your CRM
        </p>
      </div>

      {/* Input Box at the Bottom */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <textarea
            className="w-full p-3 pr-20 border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500"
            rows="2"
            placeholder="Message your AI"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500 text-right">
          AI can make mistakes - check important information.
        </p>
      </div>
    </div>
  );
};