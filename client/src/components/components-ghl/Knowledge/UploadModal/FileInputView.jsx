// src/components/components-ghl/Knowledge/UploadModal/FileInputView.jsx
import React, { useState, useRef } from "react";
import { FolderUp, FileText, X, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED = ".pdf,.doc,.docx,.txt,.md,.csv";

const FileInputView = ({ onClose, onBack, onNext }) => {
  const [file,     setFile]     = useState(null);
  const [progress, setProgress] = useState(0);
  const [done,     setDone]     = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const loadFile = (f) => {
    if (!f) return;
    setFile(f);
    setProgress(0);
    setDone(false);
    let p = 0;
    const iv = setInterval(() => {
      p += 12;
      if (p >= 100) { p = 100; clearInterval(iv); setDone(true); }
      setProgress(p);
    }, 150);
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
    setDone(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  };

  const fmt = (bytes) => {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <FolderUp className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Upload a file</p>
            <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, TXT, MD or CSV — up to 10 MB.</p>
          </div>
        </div>

        {/* Dropzone */}
        {!file && (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
              ${dragging
                ? "border-violet-400 bg-violet-50/60"
                : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"
              }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all
              ${dragging ? "bg-violet-100" : "bg-gray-50"}`}>
              <FolderUp className={`w-6 h-6 transition-colors ${dragging ? "text-violet-500" : "text-gray-300"}`} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                {dragging ? "Drop it here!" : "Click or drag & drop a file"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">PDF · DOCX · TXT · MD · CSV</p>
            </div>
            <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => loadFile(e.target.files[0])} />
          </div>
        )}

        {/* File progress card */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-white"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                  ${done ? "bg-emerald-50" : "bg-violet-50"}`}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <FileText className="w-5 h-5 text-violet-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold tabular-nums ${done ? "text-emerald-500" : "text-violet-500"}`}>
                    {done ? "Done" : `${progress}%`}
                  </span>
                  <button onClick={clearFile} className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors ${done ? "bg-emerald-500" : "bg-violet-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.15 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => done && onNext(file)}
          disabled={!done}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-md shadow-violet-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

export default FileInputView;
