// src/components/assistants/CreateAssistantModal.jsx
import React from 'react';
import { X, Info, FileText, Upload, Layout, GitBranch } from 'lucide-react'; 
const CreateAssistantOption = ({ icon: Icon, title, description, isBeta = false, onClick }) => (
  <button
    className="flex flex-col items-start p-4 border border-gray-200 rounded-md text-left cursor-pointer hover:bg-gray-50 transition-colors h-full"
    onClick={onClick}
  >
    <div className="flex items-center justify-between w-full mb-2">
      <div className="p-2 rounded-full bg-indigo-50 text-indigo-600">
        <Icon className="w-5 h-5" />
      </div>
      {isBeta && (
        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
          BETA
        </span>
      )}
      <Info className="w-4 h-4 text-gray-400 ml-auto" title="More info" />
    </div>
    <p className="font-semibold text-gray-800 text-base mb-1">{title}</p>
    <p className="text-sm text-gray-500">{description}</p>
  </button>
);

const CreateAssistantModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOptionClick = (option) => {
    console.log('Selected Assistant Creation Option:', option);
    
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
   
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Create Assistant</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="mb-8">
          <p className="text-base text-gray-700 mb-6">How would you like to create your next employee?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="col-span-full">
              <p className="text-sm font-semibold text-gray-600 mb-3">Assistant Builder</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CreateAssistantOption
                  icon={FileText}
                  title="Generate Assistant"
                  description="Generate an assistant based off of your business's profile and a brief description."
                  onClick={() => handleOptionClick('generate')}
                />
                <CreateAssistantOption
                  icon={Upload}
                  title="Import With ID"
                  description="Import an assistant using the unique ID to create a duplicate in your account."
                  onClick={() => handleOptionClick('import-id')}
                />
                <CreateAssistantOption
                  icon={Layout}
                  title="Blank Canvas"
                  description="Create an assistant with no configuration to start building with a blank canvas."
                  onClick={() => handleOptionClick('blank-canvas')}
                />
              </div>
            </div>

            {/* Conversational Pathway options */}
            <div className="col-span-full mt-6">
              <p className="text-sm font-semibold text-gray-600 mb-3">Conversational Pathway</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CreateAssistantOption
                  icon={GitBranch}
                  title="Flowbuilder"
                  description="An objective-based conversational pathway builder. Helps with determining intent and AI focus."
                  isBeta={true}
                  onClick={() => handleOptionClick('flowbuilder')}
                />
              </div>
            </div>
          </div>
        </div>
        
        
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssistantModal;