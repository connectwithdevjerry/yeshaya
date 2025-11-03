// src/components/modals/FolderModal.jsx
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

function FolderModal({ isOpen, onClose }) {
  const [selectedColor, setSelectedColor] = useState("bg-gray-500");
  const colors = [
    "bg-gray-500", "bg-cyan-400", "bg-blue-500", "bg-orange-400",
    "bg-rose-500", "bg-violet-500", "bg-pink-400", "bg-fuchsia-400",
  ];

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Folder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="folderName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="folderName"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-blue-500"
                      : "ring-2 ring-transparent"
                  }`}
                >
                  {selectedColor === color && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-4 bg-gray-50 border-t rounded-b-lg">
          <button
            className="bg-violet-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            onClick={onClose}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderModal;