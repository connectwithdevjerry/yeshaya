// src/components/components-ghl/Knowledge/NameInputView.jsx
import React, { useState } from "react";
import { Loader2, Tag, ArrowLeft, Upload } from "lucide-react";

const NameInputView = ({ onClose, onBack, onUpload, isLoading = false, error = null }) => {
  const [name, setName] = useState("");

  const canSubmit = name.trim() && !isLoading;

  return (
    <>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Tag className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Give it a name</p>
            <p className="text-xs text-gray-400 mt-0.5">Choose a descriptive name for this knowledge base.</p>
          </div>
        </div>

        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && onUpload(name)}
            placeholder="e.g. Product FAQ, Support Docs…"
            autoFocus
            disabled={isLoading}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 placeholder:text-gray-300"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all disabled:opacity-40"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => canSubmit && onUpload(name)}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
            : <><Upload className="w-3.5 h-3.5" /> Upload</>
          }
        </button>
      </div>
    </>
  );
};

export default NameInputView;
