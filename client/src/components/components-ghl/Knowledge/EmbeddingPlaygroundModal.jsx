import React from 'react';
import { X } from 'lucide-react';

const EmbeddingPlaygroundModal = ({ isOpen, onClose, knowledgeBaseName = "Testing name" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal Container: Set to max-w-7xl for a large playground area */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Embedding playground</h2>
            <p className="text-sm text-gray-500 mt-0.5">{knowledgeBaseName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area - Placeholder for your playground logic */}
        <div className="flex-grow bg-gray-50/30 p-8 overflow-y-auto">
          {/* You can add your testing/chat interface here */}
          <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
            <p className="text-gray-400 italic">Playground interface content goes here...</p>
          </div>
        </div>

        {/* Optional Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbeddingPlaygroundModal;