import React from 'react';
import { Info, X } from 'lucide-react';

export const VoiceSettingsDropdown = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-5 overflow-y-auto max-h-[80vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800">Voice Engine</h3>
        <div className="flex gap-2">
          <Info size={18} className="text-gray-400" />
          <X size={18} className="text-gray-400 cursor-pointer" onClick={onClose} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Voice Engine Select */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 leading-relaxed">
            Optionally set the voice model used for the selected voice. Currently only elevenlab voices have voice model selections.
          </p>
          <select className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500">
            <option>Default</option>
          </select>
        </div>

        {/* Response Speed */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Response Speed (Queuing)</span>
            <Info size={16} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">Allows you to control how fast the assistant replies - 0 being slow, 1 being fast</p>
          <div className="flex flex-col gap-1">
            <input type="range" min="0" max="1" step="0.1" defaultValue="1" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-400" />
            <span className="text-[10px] text-gray-500 self-end">1 (speed)</span>
          </div>
        </div>

        {/* Sensitivity to Interruption */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Sensitivity to Interruption</span>
            <Info size={16} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">Allows you to control sensitively to interruption - 0 being no interruption allowed to 1 being mindful to audio input</p>
          <div className="flex flex-col gap-1">
            <input type="range" min="0" max="1" step="0.1" defaultValue="1" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-400" />
            <span className="text-[10px] text-gray-500 self-end">1 (sensitivity)</span>
          </div>
        </div>

        {/* Talk Speed */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">Talk Speed (Voice Output)</span>
            <Info size={16} className="text-gray-400" />
          </div>
          <p className="text-xs text-gray-500">Allows you to control how slow or fast the voice out is - 0.5 being slow, 1 being normal, 2 being fastest</p>
          <div className="flex flex-col gap-1">
            <input type="range" min="0.5" max="2" step="0.01" defaultValue="0.92" className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-400" />
            <span className="text-[10px] text-gray-500 self-end">0.92x (speed)</span>
          </div>
        </div>
      </div>
    </div>
  );
};