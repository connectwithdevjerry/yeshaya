import React, { useState, useEffect, useRef } from "react";
import { X, Info, Loader2, PlusCircle, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addDynamicMessage,
  getDynamicMessage,
} from "../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl, getSubaccountIdFromUrl } from "../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

const DynamicGreetingModal = ({ isOpen, onClose }) => {
  const [activeSegment, setActiveSegment] = useState("Outbound");
  const [greetingText, setGreetingText] = useState("");
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [searchParams] = useSearchParams();
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  
  // Extract IDs
  const assistantId = getAssistantIdFromUrl(searchParams);
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const { savingMessage, dynamicMessage, fetchingMessage } = useSelector(
    (state) => state.assistants,
  );

  // List of available variables
  const availableVariables = [
    { label: "Company Name", value: "{{companyName}}" },
    { label: "First Name", value: "{{firstName}}" },
    { label: "Agent Name", value: "{{agentName}}" },
    { label: "Contact Phone", value: "{{contactPhone}}" },
  ];

  // 1. Fetch data on open + Debug Logs
  useEffect(() => {
    if (isOpen) {
      console.log("🛠 Modal Opened. Parameters:", { subaccountId, assistantId });
      
      if (subaccountId && assistantId) {
        dispatch(getDynamicMessage({ subaccountId, assistantId }));
      } else {
        console.error("❌ Critical: Missing IDs in URL. Thunk cannot execute.");
      }
    }
  }, [isOpen, subaccountId, assistantId, dispatch]);

  // 2. Sync textarea with Redux data
  useEffect(() => {
    if (dynamicMessage) {
      const type = activeSegment.toLowerCase();
      setGreetingText(dynamicMessage[type] || "");
    }
  }, [activeSegment, dynamicMessage]);

  // 3. Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowVariableMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const insertVariable = (variableValue) => {
    setGreetingText(
      (prev) =>
        prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + variableValue
    );
    setShowVariableMenu(false);
  };

  const handleSave = async () => {
    if (!greetingText.trim()) return;

    const resultAction = await dispatch(
      addDynamicMessage({
        assistantId: assistantId,
        message: greetingText,
        type: activeSegment.toLowerCase(),
      }),
    );

    if (addDynamicMessage.fulfilled.match(resultAction)) {
      dispatch(getDynamicMessage({ subaccountId, assistantId }));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 relative">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              Dynamic Greeting
            </h3>
            <p className="text-xs text-gray-500 mt-1">Configure automated voice greetings</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            disabled={savingMessage}
          >
            <X size={20} />
          </button>
        </div>

        {/* Segment Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {["Outbound", "Inbound"].map((segment) => (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              disabled={fetchingMessage || savingMessage}
              className={`px-6 py-2 text-sm font-medium transition-all duration-150 ${
                activeSegment === segment
                  ? "border-b-2 border-indigo-600 text-indigo-600 font-bold"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {segment}
            </button>
          ))}
        </div>

        {/* Input Area Header + Variable Dropdown */}
        <div className="mb-2 flex justify-between items-center relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700">Greeting Message</label>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVariableMenu(!showVariableMenu)}
              className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded-md transition-colors"
            >
              <PlusCircle size={14} className="mr-1" /> 
              Add Variable
              <ChevronDown size={12} className={`ml-1 transition-transform ${showVariableMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Variable List Dropdown */}
            {showVariableMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in duration-100">
                {availableVariables.map((variable) => (
                  <button
                    key={variable.value}
                    type="button"
                    onClick={() => insertVariable(variable.value)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex justify-between items-center"
                  >
                    <span>{variable.label}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{variable.value}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Textarea Section */}
        <div className="relative">
          {fetchingMessage ? (
            <div className="w-full min-h-[150px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
              <p className="text-xs text-gray-400 font-medium">Fetching greeting...</p>
            </div>
          ) : (
            <>
              <textarea
                value={greetingText}
                onChange={(e) => setGreetingText(e.target.value)}
                disabled={savingMessage}
                placeholder={`Example: Hello! I'm calling from {{companyName}}...`}
                className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-700 disabled:bg-gray-50 transition-all"
              />
              <div className="flex items-start mt-2 text-gray-400">
                <Info size={14} className="mr-1.5 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] leading-relaxed">
                  Variables inside <code className="text-indigo-600 font-bold">{"{{ }}"}</code> are dynamically replaced during calls.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savingMessage || fetchingMessage || !greetingText.trim()}
            className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 min-w-[140px] shadow-sm transition-all"
          >
            {savingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Greeting"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicGreetingModal;