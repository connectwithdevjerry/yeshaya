// src/components/assistants/CreateFolderModal.jsx
import React, { useState } from 'react';
import { X, Info, Check } from 'lucide-react';

const CreateFolderModal = ({ isOpen, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-gray-400'); 
  const colors = [
    'bg-gray-400', 'bg-sky-400', 'bg-emerald-400', 'bg-yellow-400',
    'bg-orange-400', 'bg-red-400', 'bg-fuchsia-400', 'bg-purple-400'
  ];

  if (!isOpen) return null;

  const handleSave = () => {
    console.log('Creating Folder:', folderName, 'Color:', selectedColor);
    onClose();
    setFolderName(''); 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
       
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Folder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="mb-8">
          <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="relative mb-6">
            <input
              type="text"
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              placeholder="Enter folder name"
            />
            <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" title="Name of the folder" />
          </div>

          <p className="block text-sm font-medium text-gray-700 mb-2">Select color</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((colorClass) => (
              <button
                key={colorClass}
                className={`w-7 h-7 rounded-full flex items-center justify-center ${colorClass} border-2 ${selectedColor === colorClass ? 'border-indigo-500' : 'border-transparent'} transform transition-transform hover:scale-110`}
                onClick={() => setSelectedColor(colorClass)}
                title={colorClass.replace('bg-', '')} // Tooltip for color
              >
                {selectedColor === colorClass && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
        
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={folderName.trim() === ''}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;