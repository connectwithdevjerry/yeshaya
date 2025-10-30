// src/components/VoiceMenu/CopyVoiceByIdModal.jsx (or similar path)
import React, { useState } from "react";
import { X, Info } from "lucide-react";

const CopyVoiceByIdModal = ({ isOpen, onClose, onDuplicate }) => {
  const [voiceId, setVoiceId] = useState("");

  if (!isOpen) return null;
  const handleDuplicate = () => {
    if (voiceId.trim()) {
      onDuplicate(voiceId.trim());
    } else {
      alert("Please enter a Voice Unique ID.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 relative">
        {/* Header and Close Button */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Copy voice by ID
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <label
            htmlFor="voiceId"
            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
          >
            Voice Unique ID
            <Info
              size={16}
              className="ml-1 text-gray-400 cursor-pointer"
              title="Enter the unique ID of the voice you wish to duplicate"
            />
          </label>
          <input
            id="voiceId"
            type="text"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            placeholder="Enter voice ID"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleDuplicate}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md hover:from-blue-600 hover:to-indigo-700 transition shadow-lg"
          >
            Duplicate Voice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyVoiceByIdModal;
