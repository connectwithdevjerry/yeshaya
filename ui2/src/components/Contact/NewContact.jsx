// src/components/contacts/NewContactModal.jsx
import React from 'react';
import { X, Hand } from 'lucide-react'; 

const NewContactModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">

        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">New Contact</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>


        <div className="space-y-4">
          <div className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="p-2 rounded-full bg-indigo-50 text-indigo-600 mr-4">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Manual</p>
              <p className="text-sm text-gray-500">Manually enter profile information</p>
            </div>
          </div>
         
        </div>
        
       
      </div>
    </div>
  );
};

export default NewContactModal;