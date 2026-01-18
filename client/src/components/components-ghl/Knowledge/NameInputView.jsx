import React, { useState } from 'react';
import { X, Info, Loader2 } from 'lucide-react';

const NameInputView = ({ onClose, onBack, onUpload, isLoading = false, error = null }) => {
  const [name, setName] = useState('');

  const handleUpload = () => {
    if (name.trim() && !isLoading) {
      onUpload(name);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim() && !isLoading) {
      handleUpload();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Upload</h2>
          <Info size={18} className="text-gray-400 cursor-help" />
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          disabled={isLoading}
        >
          <X size={20} />
        </button>
      </div>

      {/* Body - High padding to match the centered look */}
      <div className="p-10">
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Name"
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-700 shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            autoFocus
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end items-center gap-4 px-6 py-4 border-t border-gray-100">
        <button 
          onClick={onBack}
          disabled={isLoading}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close
        </button>
        <button 
          onClick={handleUpload}
          disabled={!name.trim() || isLoading}
          className={`px-6 py-2 rounded-md text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 ${
            name.trim() && !isLoading
              ? 'bg-[#a389f4] hover:bg-[#9175e6]' 
              : 'bg-purple-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <span>Upload</span>
          )}
        </button>
      </div>
    </>
  );
};

export default NameInputView;