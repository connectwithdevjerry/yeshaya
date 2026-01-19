import React, { useState } from "react";
import { X, Info } from "lucide-react";

const TextInputView = ({ onClose, onBack, onNext }) => {
  const [inputText, setInputText] = useState("");

  const handleNext = () => {
    if (inputText.trim()) {
      onNext(inputText.trim());
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Upload</h2>
          <div className="group relative">
            <Info size={18} className="text-gray-400 cursor-help" />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
              Paste the text you want to be processed and stored.
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Input text to be embedded
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your content here..."
          className="w-full h-80 p-4 border border-gray-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-gray-800 font-mono text-sm placeholder:text-gray-300"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onBack}
          className="px-5 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!inputText.trim()}
          className={`px-8 py-2 rounded-lg font-semibold text-white transition-all shadow-sm ${
            inputText.trim() 
              ? 'bg-[#a389f4] hover:bg-[#9175e6] active:scale-95' 
              : 'bg-purple-300 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default TextInputView;