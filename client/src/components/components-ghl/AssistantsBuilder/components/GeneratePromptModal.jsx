// src/components/assistant/GeneratePromptModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Sparkle, Loader2 } from 'lucide-react';
import { generatePrompt, clearGeneratedPrompt } from '../../../../store/slices/assistantsSlice';

export const GeneratePromptModal = ({ isOpen, onClose, onPromptGenerated }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState('');
    
    const { generatingPrompt, generatedPrompt, promptError } = useSelector(
        (state) => state.assistants
    );

    useEffect(() => {
        if (generatedPrompt) {
            if (onPromptGenerated) {
                onPromptGenerated(generatedPrompt);
            }

            setDescription('');
            dispatch(clearGeneratedPrompt());
            onClose();
        }
    }, [generatedPrompt, onPromptGenerated, onClose, dispatch]);

    useEffect(() => {
        if (!isOpen) {
            setDescription('');
            dispatch(clearGeneratedPrompt());
        }
    }, [isOpen, dispatch]);

    const handleGenerate = async () => {
        if (!description.trim()) {
            return;
        }

        try {
            await dispatch(generatePrompt({ description: description.trim() })).unwrap();
        } catch (error) {
            console.error('Failed to generate prompt:', error);

        }
    };

    const handleClose = () => {
        if (!generatingPrompt) {
            setDescription('');
            dispatch(clearGeneratedPrompt());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
            onClick={handleClose} 
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-lg shadow-2xl w-full max-w-3xl mx-4 p-6 flex flex-col"
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900">Generate Prompt</h3>
                    <button 
                        onClick={handleClose} 
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full disabled:opacity-50"
                        disabled={generatingPrompt}
                    >
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-96 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Explain exactly what you want in as much detail as you can..."
                        disabled={generatingPrompt}
                    />
                    
                    {/* Error Message */}
                    {promptError && (
                        <p className="mt-2 text-sm text-red-600">
                            {promptError}
                        </p>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={generatingPrompt}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={generatingPrompt || !description.trim()}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generatingPrompt ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkle className="w-4 h-4" />
                                <span>Generate Prompt</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};