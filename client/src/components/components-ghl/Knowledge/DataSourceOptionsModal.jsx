import React, { useState } from 'react';
import { X, Info, Box } from 'lucide-react';

const DataSourceOptionsModal = ({ isOpen, onClose, dataSource }) => {
  const [showData, setShowData] = useState(true);

  if (!isOpen || !dataSource) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden transition-all">
        
        {/* Header - Matches "sdf" title with Info icon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">{dataSource.source}</h2>
            <Info size={18} className="text-gray-400 cursor-help" />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Name Input Field with Floating Label style */}
          <div className="relative">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-semibold text-gray-500 z-10">
              Name
            </label>
            <input
              type="text"
              defaultValue={dataSource.source}
              className="w-full p-4 border border-gray-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Associated Key Value Pairs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Associated key value pairs</h3>
                <p className="text-xs text-gray-400">See the text that was embedded into the model</p>
              </div>
              <button 
                onClick={() => setShowData(!showData)}
                className="px-4 py-2 bg-black text-white text-xs font-bold rounded-md hover:bg-gray-800 transition-colors"
              >
                Toggle Data
              </button>
            </div>

            {/* Embedded Text Preview */}
            {showData && (
              <div className="flex items-start gap-3 p-2">
                <Box size={18} className="text-[#10b981] mt-0.5 shrink-0" />
                <p className="text-sm text-gray-500 break-all leading-relaxed">
                  asdfasdfasdfasdfasdfasddsfafasdfasdfasfas
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Full Width Save Button */}
        <div className="px-8 pb-8">
          <button
            onClick={() => {
              console.log("Saving changes...");
              onClose();
            }}
            className="w-full py-4 bg-[#7c5cfc] hover:bg-[#6b4ae0] text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceOptionsModal;