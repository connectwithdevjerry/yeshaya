// src/components/VoiceMenu/CloneYourVoiceModal.jsx (or included near VoiceMenuDrawer)
import React, { useState } from "react";
import { X } from "lucide-react";

const CloneYourVoiceModal = ({ isOpen, onClose, onClone }) => {
  const [voiceName, setVoiceName] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);

  if (!isOpen) return null; 

  const handleClone = () => {
    if (!voiceName.trim() || !isConsentChecked) {
      alert("Please enter a name and agree to the terms.");
      return;
    }
    onClone(voiceName.trim());
    onClose(); 
  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6 relative">
        
        {/* Header and Close Button */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Clone Your Voice
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label htmlFor="voiceName" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            id="voiceName"
            type="text"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
          />
        </div>

        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-md p-12 text-center text-gray-500 bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
          <p>Upload a file by clicking here</p>
          <input type="file" multiple accept="audio/*" className="hidden" />
        </div>

        {/* Consent Checkbox */}
        <div className="mb-6 flex items-start">
          <input
            id="consent"
            type="checkbox"
            checked={isConsentChecked}
            onChange={(e) => setIsConsentChecked(e.target.checked)}
            className="mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="consent" className="ml-3 text-sm text-gray-600">
            I hereby confirm that I have all necessary rights or consents to upload and close these voice samples and that I will not use the platform generated content for any illegal, fraudulent, or harmful purposes.
          </label>
        </div>


        {/* Clone Voice Button (Gradient Style) */}
        <div className="flex justify-center">
          <button
            onClick={handleClone}
            disabled={!isConsentChecked} 
            className={`w-full px-6 py-3 text-lg font-semibold text-white rounded-md shadow-lg transition ${
              isConsentChecked
                ? 'bg-gradient-to-r from-purple-400 to-indigo-600 hover:from-purple-500 hover:to-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Clone Voice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CloneYourVoiceModal;