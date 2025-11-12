import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditNameModal = ({ isOpen, onClose, initialName, onSave }) => {
  const [name, setName] = useState(initialName || '');


  // Update local state if initialName changes (e.g., when the modal opens)
  useEffect(() => {
    setName(initialName || '');
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Basic validation
    if (name.trim() === '') {
      console.error("Name cannot be empty.");
      return;
    }
    onSave(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex justify-center items-center">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 transition-all transform scale-100"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Change Name</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <label htmlFor="knowledge-name" className="text-sm font-medium text-gray-700 block">
            Name
          </label>
          <input
            id="knowledge-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm"
            placeholder="Enter knowledge base name"
          />
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end">
          <button
            onClick={handleSave}
            disabled={ name.trim() === ''}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNameModal;