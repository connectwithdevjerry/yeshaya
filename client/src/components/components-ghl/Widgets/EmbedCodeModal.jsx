// src/components/components-ghl/Widgets/EmbedCodeModal.jsx
import React, { useState } from "react";
import { X, Copy, Check, Code2 } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../../store/api/config";

const EmbedCodeModal = ({ isOpen, onClose, widget }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !widget) return null;

  const base = (API_BASE_URL || "").replace(/\/$/, "");
  const snippet = `<script src="${base}/embed/widget.js" data-widget-id="${widget.publicId}" async></script>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      toast.success("Snippet copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Embed “{widget.name}”</h3>
              <p className="text-xs text-gray-400">Paste this just before the closing &lt;/body&gt; tag.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 text-xs rounded-xl p-4 pr-12 overflow-x-auto whitespace-pre-wrap break-all font-mono">
              {snippet}
            </pre>
            <button
              onClick={copy}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-xs text-gray-500 space-y-1.5 bg-gray-50 rounded-xl p-3.5">
            <p>• Works on any website — just add the script tag.</p>
            <p>• A chat bubble appears bottom-{widget.theme?.position === "bottom-left" ? "left" : "right"}; visitors chat with <span className="font-semibold">{widget.assistantName || "the linked assistant"}</span>.</p>
            <p>
              {widget.allowedDomains?.length
                ? `• Allowed on: ${widget.allowedDomains.join(", ")}`
                : "• Allowed on any domain. Set allowed domains in the widget settings to restrict usage."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
            Close
          </button>
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy snippet"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbedCodeModal;
