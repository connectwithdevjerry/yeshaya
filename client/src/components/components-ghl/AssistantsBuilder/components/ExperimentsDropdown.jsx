import React from "react";
import { Monitor, MessageSquare, Phone, Loader2 } from "lucide-react";

export const ExperimentsDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const results = [
    { title: "Test Result", icon: <Monitor className="w-5 h-5 text-indigo-500" />, bgColor: "bg-indigo-50" },
    { title: "Chat AI", icon: <MessageSquare className="w-5 h-5 text-indigo-500" />, bgColor: "bg-indigo-50" },
    { title: "Voice AI", icon: <Phone className="w-5 h-5 text-indigo-500" />, bgColor: "bg-indigo-50" },
  ];

  return (
    <>
      {/* Backdrop to close when clicking outside */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      
      <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Audit Results</h3>
        </div>

        {/* List of Results */}
        <div className="p-3 space-y-2">
          {results.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div className={`p-2 rounded-lg ${item.bgColor} mr-4`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400">Waiting...</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end items-center border-t border-gray-100">
          <button 
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2"
          >
            Close
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </button>
        </div>
      </div>
    </>
  );
};