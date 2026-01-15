// DynamicGreetingModal.jsx
import React, { useState } from "react";
import { X, Info, Loader2, PlusCircle } from "lucide-react"; 
import { useDispatch, useSelector } from "react-redux";
import { addDynamicMessage } from "../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

const DynamicGreetingModal = ({ isOpen, onClose,  }) => {
  const [activeSegment, setActiveSegment] = useState("Outbound");
  const [greetingText, setGreetingText] = useState("");
  const [searchParams] = useSearchParams();
  const assistantId = getAssistantIdFromUrl(searchParams);
  
  const dispatch = useDispatch();
  
  const { savingMessage } = useSelector((state) => state.assistants);

  if (!isOpen) return null;


  const insertVariable = () => {
    const variable = "{{companyName}}";
    setGreetingText((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + variable);
  };

  const handleSave = async () => {
    if (!greetingText.trim()) return;


    const resultAction = await dispatch(
      addDynamicMessage({
        assistantId: assistantId,
        message: greetingText, 
        type: activeSegment.toLowerCase(), 
      })
    );

    if (addDynamicMessage.fulfilled.match(resultAction)) {
      setGreetingText(""); 
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
              disabled={savingMessage}
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

        {/* Text Area Label & Variable Helper */}
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">Greeting Message</label>
          <button
            type="button"
            onClick={insertVariable}
            className="flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-2 py-1 rounded"
          >
            <PlusCircle size={14} className="mr-1" />
            Add Company Name
          </button>
        </div>

        {/* Text Area */}
        <div className="relative">
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
              The tag <code className="text-indigo-600 font-bold">{"{{companyName}}"}</code> will be replaced automatically with the actual subaccount name.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onClose}
            disabled={savingMessage}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savingMessage || !greetingText.trim()}
            className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition shadow-sm disabled:bg-indigo-400 min-w-[140px]"
          >
            {savingMessage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
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