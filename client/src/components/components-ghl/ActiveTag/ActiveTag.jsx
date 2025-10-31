// src/components/tags/CreateActiveTagModal.jsx
import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

const CreateActiveTagModal = ({ isOpen, onClose }) => {
  const [tagName, setTagName] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    console.log('Creating Active Tag:', tagName);
    onClose();
    setTagName(''); // Clear input after saving
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Create active tag</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mb-8">
          <label htmlFor="tag-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="tag-name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              placeholder="Enter tag name"
            />
            <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" title="Name of the active tag" />
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={tagName.trim() === ''}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActiveTagModal;