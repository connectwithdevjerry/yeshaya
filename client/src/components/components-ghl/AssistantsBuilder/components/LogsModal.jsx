import React from "react";
import { X, Info } from "lucide-react";

export const LogsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header - Matches Screenshot 233909 */}
        <div className="flex justify-between items-start px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Embedding playground</h2>
            <p className="text-xs text-gray-500 mt-0.5">Testing name</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - The "Playground" */}
        <div className="flex-1 bg-[#f8faff] p-8 overflow-y-auto">
          {/* This area is currently empty to match your playground screenshot */}
          <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center space-y-2">
               <div className="text-4xl opacity-20">📊</div>
               <p className="text-gray-400 font-medium">No logs or embedding data to display yet.</p>
            </div>
          </div>
        </div>

        {/* Footer - Subtle gray bar matching GHL style */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};