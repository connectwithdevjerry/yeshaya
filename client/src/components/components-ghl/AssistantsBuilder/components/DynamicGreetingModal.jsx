import React, { useState, useEffect, useRef } from "react";
import { X, Info, Loader2, PlusCircle, ChevronDown, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  addDynamicMessage,
  getDynamicMessage,
} from "../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl, getSubaccountIdFromUrl } from "../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

const DynamicGreetingModal = ({ isOpen, onClose }) => {
  const [activeSegment,    setActiveSegment]    = useState("Outbound");
  const [greetingText,     setGreetingText]     = useState("");
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [searchParams]  = useSearchParams();
  const dropdownRef     = useRef(null);
  const dispatch        = useDispatch();

  const assistantId  = getAssistantIdFromUrl(searchParams);
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const { savingMessage, dynamicMessage, fetchingMessage } = useSelector(
    (s) => s.assistants
  );

  const availableVariables = [
    { label: "Company Name",   value: "{{companyName}}"   },
    { label: "First Name",     value: "{{firstName}}"     },
    { label: "Agent Name",     value: "{{agentName}}"     },
    { label: "Contact Phone",  value: "{{contactPhone}}"  },
  ];

  useEffect(() => {
    if (isOpen && subaccountId && assistantId) {
      dispatch(getDynamicMessage({ subaccountId, assistantId }));
    }
  }, [isOpen, subaccountId, assistantId, dispatch]);

  useEffect(() => {
    if (dynamicMessage) {
      setGreetingText(dynamicMessage[activeSegment.toLowerCase()] || "");
    }
  }, [activeSegment, dynamicMessage]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowVariableMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const insertVariable = (val) => {
    setGreetingText((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + val);
    setShowVariableMenu(false);
  };

  const handleSave = async () => {
    if (!greetingText.trim()) return;
    const result = await dispatch(
      addDynamicMessage({ assistantId, message: greetingText, type: activeSegment.toLowerCase() })
    );
    if (addDynamicMessage.fulfilled.match(result)) {
      dispatch(getDynamicMessage({ subaccountId, assistantId }));
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Mic className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Dynamic Greeting</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Configure automated voice greetings</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={savingMessage}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-0">
              {["Outbound", "Inbound"].map((seg) => (
                <button
                  key={seg}
                  onClick={() => setActiveSegment(seg)}
                  disabled={fetchingMessage || savingMessage}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                    activeSegment === seg
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {seg}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
              {/* Label + variable picker */}
              <div className="flex items-center justify-between" ref={dropdownRef}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Greeting Message
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVariableMenu((p) => !p)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Add Variable
                    <ChevronDown className={`w-3 h-3 transition-transform ${showVariableMenu ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showVariableMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute right-0 mt-1.5 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden"
                      >
                        {availableVariables.map((v) => (
                          <button
                            key={v.value}
                            type="button"
                            onClick={() => insertVariable(v.value)}
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex justify-between items-center gap-3"
                          >
                            <span className="font-medium">{v.label}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{v.value}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Textarea */}
              {fetchingMessage ? (
                <div className="w-full min-h-[150px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mb-2" />
                  <p className="text-xs text-gray-400 font-medium">Fetching greeting…</p>
                </div>
              ) : (
                <textarea
                  value={greetingText}
                  onChange={(e) => setGreetingText(e.target.value)}
                  disabled={savingMessage}
                  placeholder={`Example: Hello! I'm calling from {{companyName}}…`}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed placeholder:text-gray-300 leading-relaxed"
                />
              )}

              <div className="flex items-start gap-1.5 text-gray-400">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Variables inside <code className="text-indigo-600 font-bold">{"{{ }}"}</code> are dynamically replaced during calls.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={onClose}
                disabled={savingMessage}
                className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-white border border-transparent hover:border-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={savingMessage || fetchingMessage || !greetingText.trim()}
                whileHover={!savingMessage && greetingText.trim() ? { scale: 1.02 } : {}}
                whileTap={!savingMessage && greetingText.trim() ? { scale: 0.98 } : {}}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingMessage ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                ) : (
                  "Save Greeting"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicGreetingModal;
