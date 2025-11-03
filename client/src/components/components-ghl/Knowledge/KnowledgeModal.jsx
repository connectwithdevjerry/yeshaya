// src/components/knowledge/NewKnowledgeBaseModal.jsx
import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

const NewKnowledgeBaseModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    // Logic to create the knowledge base (e.g., API call)
    console.log('Creating Knowledge Base:', name);
    onClose(); // Close the modal after action
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Knowledge Base</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Name Input */}
        <div className="mb-8">
          <label htmlFor="kb-name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="kb-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              placeholder="Enter name for Knowledge Base"
            />
            <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" title="Name of the knowledge base" />
          </div>
        </div>
        
        {/* Modal Footer - Actions */}
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
          >
            Close
          </button>
          <button 
            onClick={handleCreate} 
            disabled={name.trim() === ''}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            Create Knowledge Base
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewKnowledgeBaseModal;