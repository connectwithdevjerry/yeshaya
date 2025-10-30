// src/components/VoiceMenu/ElevenLabsImportModal.jsx (or included near VoiceMenuDrawer)
import React, { useState } from "react";
import { X, Search } from "lucide-react";

const ElevenLabsImportModal = ({ isOpen, onClose, onImport }) => {
  const [searchText, setSearchText] = useState("");

  if (!isOpen) return null; 

  const handleImport = () => {
   
    onImport(searchText.trim());
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4 p-6 relative">
        

        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            ElevenLabs Import
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-2">
            <label htmlFor="voiceSearch" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <button className="text-sm font-medium text-blue-600 hover:underline">
              ElevenLabs Library
            </button>
          </div>
          
          <div className="relative">
            <input
              id="voiceSearch"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Adam Stone, english, conversational, etc."
              className="w-full p-3 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800"
            />
            <button 
              onClick={() => console.log("Perform Search with:", searchText)}
              className="absolute right-0 top-0 h-full px-4 bg-gray-800 text-white rounded-r-md hover:bg-black transition flex items-center"
              title="Search"
            >
                <Search className="w-5 h-5" />
                <span className="ml-2">Search</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleImport}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-600 rounded-md hover:from-purple-500 hover:to-indigo-700 transition shadow-lg"
          >
            Import Voice
          </button>
        </div>
      </div>
    </div>
  );
};

export default ElevenLabsImportModal;