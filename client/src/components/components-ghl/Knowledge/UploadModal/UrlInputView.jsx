// src/components/components-ghl/Knowledge/UploadModal/UrlInputView.jsx
import React, { useState } from "react";
import { Globe, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";

const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };

const UrlInputView = ({ onClose, onBack, onNext }) => {
  const [url, setUrl] = useState("");
  const valid   = isValidUrl(url);
  const hasText = url.length > 0;

  return (
    <>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Globe className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Enter a website URL</p>
            <p className="text-xs text-gray-400 mt-0.5">We'll scrape the page content and embed it for you.</p>
          </div>
        </div>

        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && valid && onNext(url)}
            placeholder="https://example.com/docs"
            autoFocus
            className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm bg-white outline-none transition-all
              ${hasText && !valid
                ? "border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                : "border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              } placeholder:text-gray-300`}
          />
        </div>

        {hasText && !valid && (
          <div className="flex items-center gap-2 text-xs text-rose-500 px-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Please enter a valid URL (e.g. https://example.com)
          </div>
        )}

        {valid && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
            <p className="text-xs text-orange-600 truncate">{url}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <button
          onClick={() => valid && onNext(url)}
          disabled={!valid}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};

export default UrlInputView;
