// src/components/components-ghl/Assistants/GenerateAssistantFormModal.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Info } from "lucide-react";
import { createAssistant } from "../../../store/slices/assistantsSlice";
import { useCurrentAccount } from "../../../hooks/useCurrentAccount";
import { useSearchParams } from "react-router-dom";

const GenerateAssistantFormModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const account = useCurrentAccount();

  // ✅ Get subaccountId dynamically
  const subaccountId = searchParams.get('subaccount') || account?.subaccount;

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!name.trim()) {
      alert("Assistant name is required");
      return;
    }

    if (!subaccountId) {
      alert("No subaccount selected");
      return;
    }

    try {
      await dispatch(
        createAssistant({ name, description, subaccountId })
      ).unwrap();
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("❌ Error creating assistant:", err);
      alert(err.message || "Failed to create assistant");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Generate Assistant
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 absolute top-4 right-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mb-8">
          <label className="block">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Name <Info className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            />
          </label>

          <label className="block">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Description <Info className="w-4 h-4 text-gray-400 ml-1" />
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800 resize-none"
            />
          </label>

          {/* ✅ Show current subaccount */}
          {subaccountId && (
            <div className="text-xs text-gray-500">
              <p>Sub-account: {subaccountId.slice(0, 8)}...</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 mr-3"
          >
            Close
          </button>
          <button
            onClick={handleGenerate}
            disabled={!name.trim() || !subaccountId}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition ${
              name.trim() && subaccountId
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Generate Assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateAssistantFormModal;