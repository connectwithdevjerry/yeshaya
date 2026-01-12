import React, { useState, useRef } from 'react';
import { X, Info, FileText, UploadCloud } from 'lucide-react';

const FileInputView = ({ onClose, onBack, onNext }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800">Upload</h2>
          <Info size={18} className="text-gray-400 cursor-help" />
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Dropzone Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <p className="text-gray-500 font-medium text-center">
            Click here to choose file to upload
          </p>
        </div>

        {/* Upload Progress Card */}
        {selectedFile && (
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 relative">
            <div className="flex items-center gap-3">
              <div className="bg-[#10b981]/10 p-2 rounded-lg">
                <FileText className="text-[#10b981] w-6 h-6" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-800">Uploading</span>
                  <button onClick={clearFile} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
              <div className="text-xs font-bold text-gray-800 self-end mb-1">
                {uploadProgress === 100 ? "Finished" : `${uploadProgress}%`}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#10b981] h-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button onClick={onBack} className="px-5 py-2 text-gray-600 font-medium hover:text-gray-800">
          Close
        </button>
        <button
          onClick={() => onNext(selectedFile)}
          disabled={!selectedFile || uploadProgress < 100}
          className={`px-8 py-2 rounded-lg font-semibold text-white transition-all shadow-sm ${
            selectedFile && uploadProgress === 100
              ? 'bg-[#a389f4] hover:bg-[#9175e6]' 
              : 'bg-purple-300 cursor-not-allowed'
          }`}
        >
          Upload
        </button>
      </div>
    </>
  );
};

export default FileInputView;