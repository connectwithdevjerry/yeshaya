// src/components/widgets/CreateWidgetModal.jsx
import React from 'react';
import { X, Globe, Play, MessageSquare, Info } from 'lucide-react';

const WidgetOption = ({ icon: Icon, title, description, isBeta = false, onClick }) => (
  <button
    className="flex items-start p-4 border border-gray-200 rounded-lg text-left w-full cursor-pointer hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-grow">
      <p className="font-semibold text-gray-800 text-base flex items-center">
        {title}
        {isBeta && (
          <span className="ml-2 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
            BETA
          </span>
        )}
      </p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <Info className="w-4 h-4 text-gray-400 ml-4" title="More info" />
  </button>
);

const CreateWidgetModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCreate = (type) => {
    console.log('Creating Widget Type:', type);
    // Logic to proceed with widget creation (e.g., navigate to config page)
    onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Create Widget</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget Options */}
        <div className="space-y-3 mb-8">
          <WidgetOption
            icon={Globe}
            title="Floating Orb"
            description="A floating reactive orb for your website"
            onClick={() => handleCreate('Floating Orb')}
          />
          <WidgetOption
            icon={Play}
            title="Programmable Button"
            description="Programmable button for voice interactions"
            onClick={() => handleCreate('Programmable Button')}
          />
          <WidgetOption
            icon={MessageSquare}
            title="Chat Widget"
            description="Customizable AI-powered chat widget"
            isBeta={true}
            onClick={() => handleCreate('Chat Widget')}
          />
        </div>
        
        {/* Modal Footer */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Create widget
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal;