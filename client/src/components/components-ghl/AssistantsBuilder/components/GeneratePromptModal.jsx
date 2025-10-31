// src/components/assistant/GeneratePromptModal.jsx
import React from 'react';
import { X, Sparkle } from 'lucide-react';

export const GeneratePromptModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
            onClick={onClose} 
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 p-6 flex flex-col"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Generate Prompt</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="mb-6">
                    <label htmlFor="prompt-description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="prompt-description"
                        className="w-full h-96 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none"
                        placeholder="Explain exactly what you want in as much detail as you can..."
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center space-x-2"
                    >
                        <Sparkle className="w-4 h-4" />
                        <span>Generate Prompt</span>
                    </button>
                </div>
            </div>
        </div>
    );
};