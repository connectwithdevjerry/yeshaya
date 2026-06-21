// src/components/components-ghl/Knowledge/UploadModal/TextInputView.jsx
import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Type } from "lucide-react";

const MAX_CHARS = 50000;

const TextInputView = ({ onClose, onBack, onNext }) => {
  const [text, setText] = useState("");
  const remaining = MAX_CHARS - text.length;
  const canNext   = text.trim().length > 0;

  return (
    <>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Type className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Paste your text</p>
            <p className="text-xs text-gray-400 mt-0.5">This content will be chunked and embedded into the model.</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Paste or type your content here…"
            autoFocus
            className="w-full h-72 p-4 border border-gray-200 rounded-xl text-sm bg-white outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed placeholder:text-gray-300"
          />
          <span className={`absolute bottom-3 right-3 text-[10px] font-medium transition-colors
            ${remaining < 1000 ? "text-rose-400" : "text-gray-300"}`}>
            {remaining.toLocaleString()} left
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => canNext && onNext(text.trim())}
          disabled={!canNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

export default TextInputView;
