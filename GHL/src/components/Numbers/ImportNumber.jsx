// src/components/numbers/ImportNumberModal.jsx
import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

const ImportNumberModal = ({ isOpen, onClose }) => {
  const [number, setNumber] = useState('');
  const [terminationUri, setTerminationUri] = useState('');

  if (!isOpen) return null;

  const handleImport = () => {
    console.log('Importing Number:', { number, terminationUri });
    onClose();
    setNumber('');
    setTerminationUri('');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Import a number</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-6 mb-8">
          {/* Number Input */}
          <div>
            <label htmlFor="import-number" className="block text-sm font-medium text-gray-700 mb-1">
              Number (raw format)
            </label>
            <div className="relative">
              <input
                type="text"
                id="import-number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              />
              <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" title="Raw format phone number" />
            </div>
          </div>

          {/* Termination URI Input */}
          <div>
            <label htmlFor="termination-uri" className="block text-sm font-medium text-gray-700 mb-1">
              Termination URI
            </label>
            <div className="relative">
              <input
                type="text"
                id="termination-uri"
                value={terminationUri}
                onChange={(e) => setTerminationUri(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm pr-10"
              />
              <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" title="Termination URI" />
            </div>
          </div>
          
          <p className="text-sm font-medium text-indigo-600 cursor-pointer hover:text-indigo-800">
            <span className="mr-1 inline-block">{'<'}</span> Add Authentication
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700">
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={number.trim() === '' || terminationUri.trim() === ''}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            Import number
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportNumberModal;