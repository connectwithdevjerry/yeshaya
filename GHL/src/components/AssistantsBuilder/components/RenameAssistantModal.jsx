// src/components/assistant/RenameAssistantModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

export const RenameAssistantModal = ({ isOpen, onClose, currentName = "New Blank Assistant" }) => {
  const [assistantName, setAssistantName] = useState(currentName);

  if (!isOpen) return null;

  const handleSave = () => {
    // In a real app, you'd call an API to save the new name here
    console.log("Saving new assistant name:", assistantName);
    onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
      onClick={onClose} // Close when clicking outside the modal content
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Assistant Name</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Input Field) */}
        <div className="p-6 space-y-4">
          <label htmlFor="assistant-name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="assistant-name"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={assistantName}
            onChange={(e) => setAssistantName(e.target.value)}
            placeholder="New Blank Assistant"
          />
        </div>

        {/* Footer (Save Button) */}
        <div className="p-5 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-violet-600 text-white font-medium rounded-md shadow-md hover:bg-violet-700 transition-colors duration-150"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};