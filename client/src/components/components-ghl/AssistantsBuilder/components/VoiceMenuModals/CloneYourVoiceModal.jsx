// src/components/VoiceMenu/CloneYourVoiceModal.jsx
import React, { useState, useRef } from "react";
import { X, Wand2, UploadCloud, Mic2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CloneYourVoiceModal = ({ isOpen, onClose, onClone }) => {
  const [voiceName,        setVoiceName]        = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [files,            setFiles]            = useState([]);
  const [isDragging,       setIsDragging]       = useState(false);
  const inputRef = useRef(null);

  const handleClose = () => {
    setVoiceName("");
    setIsConsentChecked(false);
    setFiles([]);
    onClose();
  };

  const handleClone = () => {
    if (!voiceName.trim() || !isConsentChecked) return;
    onClone?.(voiceName.trim());
    handleClose();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("audio/"));
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files).filter((f) => f.type.startsWith("audio/"));
    setFiles((prev) => [...prev, ...picked]);
  };

  const canClone = voiceName.trim() && isConsentChecked;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Mic2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Clone Your Voice</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Upload audio samples to clone a voice</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Voice Name
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g. My Custom Voice"
                  autoFocus
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300"
                />
              </div>

              {/* File drop zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Audio Samples
                </label>
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-2 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? "border-indigo-400 bg-indigo-50/50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/40 hover:bg-gray-50"
                  }`}
                >
                  <UploadCloud className={`w-7 h-7 ${isDragging ? "text-indigo-400" : "text-gray-300"}`} />
                  <p className="text-xs font-medium text-gray-400">
                    Drop audio files here, or <span className="text-indigo-600 font-semibold">click to browse</span>
                  </p>
                  <p className="text-[10px] text-gray-300">Accepts .mp3, .wav, .ogg, etc.</p>
                  <input ref={inputRef} type="file" multiple accept="audio/*" className="hidden" onChange={handleFileChange} />
                </div>

                {files.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                        <Mic2 className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                        <span className="text-xs text-gray-600 truncate">{f.name}</span>
                        <span className="ml-auto text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setIsConsentChecked((p) => !p)}
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    isConsentChecked
                      ? "bg-indigo-600 border-indigo-600"
                      : "border-gray-300 group-hover:border-indigo-400"
                  }`}
                >
                  {isConsentChecked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  I hereby confirm that I have all necessary rights or consents to upload and clone these voice samples, and that I will not use the generated content for any illegal, fraudulent, or harmful purposes.
                </p>
              </label>

              {!isConsentChecked && voiceName.trim() && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-600">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  You must agree to the consent statement to proceed.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleClone}
                disabled={!canClone}
                whileHover={canClone ? { scale: 1.02 } : {}}
                whileTap={canClone ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-3.5 h-3.5" /> Clone Voice
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CloneYourVoiceModal;
