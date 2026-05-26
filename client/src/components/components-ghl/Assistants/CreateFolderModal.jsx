// src/components/assistants/CreateFolderModal.jsx
import React, { useState } from 'react';
import { X, Info, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const CreateFolderModal = ({ isOpen, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-gray-400');
  const colors = [
    'bg-gray-400', 'bg-sky-400', 'bg-emerald-400', 'bg-yellow-400',
    'bg-orange-400', 'bg-red-400', 'bg-fuchsia-400', 'bg-purple-400'
  ];

  const handleSave = () => {
    console.log('Creating Folder:', folderName, 'Color:', selectedColor);
    onClose();
    setFolderName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Folder</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-8">
              <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="relative mb-6">
                <input
                  type="text"
                  id="folder-name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm pr-10 transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="Enter folder name"
                />
                <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" title="Name of the folder" />
              </div>

              <p className="block text-sm font-medium text-gray-700 mb-2">Select color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((colorClass) => (
                  <button
                    key={colorClass}
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${colorClass} border-2 ${
                      selectedColor === colorClass ? 'border-indigo-500 scale-110' : 'border-transparent'
                    } transition-all duration-150 hover:scale-110`}
                    onClick={() => setSelectedColor(colorClass)}
                    title={colorClass.replace('bg-', '')}
                  >
                    {selectedColor === colorClass && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={folderName.trim() === ''}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-lg shadow-md shadow-indigo-500/20 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateFolderModal;
