import React, { useState } from 'react';
import { X, Info, Globe } from 'lucide-react';

const UrlInputView = ({ onClose, onBack, onNext }) => {
  const [url, setUrl] = useState('');

  // Simple URL validation
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
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
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
              Enter a website URL to scrape its content.
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="p-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe size={18} className="text-gray-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800 shadow-sm transition-all"
              autoFocus
            />
          </div>
          {!isValidUrl(url) && url.length > 0 && (
            <p className="mt-2 text-xs text-red-500 pl-1">Please enter a valid URL (e.g., https://example.com)</p>
          )}
        </div>
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
          onClick={() => onNext(url)}
          disabled={!isValidUrl(url)}
          className={`px-8 py-2 rounded-lg font-semibold text-white transition-all shadow-sm ${
            isValidUrl(url) 
              ? 'bg-[#a389f4] hover:bg-[#9175e6] active:scale-95' 
              : 'bg-purple-300 cursor-not-allowed'
          }`}
        >
          Upload
        </button>
      </div>
    </>
  );
};

export default UrlInputView;