// src/components/assistant/IssuesModal.jsx (or place it above AssistantHeader)
import React from "react";
import { AlertTriangle, X } from "lucide-react";

const IssuesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
    
      
      <div 
        className="absolute top-[120px] right-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-full max-w-sm"
      >
        <div className="p-4">
          
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span>Issues</span>
            </h3>
            <span className="text-xs text-gray-500 italic">
              Click the issue to clear it
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">
              No issues found
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuesModal;