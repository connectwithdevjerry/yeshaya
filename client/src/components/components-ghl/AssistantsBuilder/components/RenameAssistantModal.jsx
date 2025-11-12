// src/components/components-ghl/AssistantsBuilder/components/RenameAssistantModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { updateAssistant } from "../../../../store/slices/assistantsSlice";
import { useCurrentAccount } from "../../../../hooks/useCurrentAccount";

export const RenameAssistantModal = ({ isOpen, onClose }) => {
  const [assistantName, setAssistantName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const account = useCurrentAccount();

  const { selectedAssistant } = useSelector((state) => state.assistants);

  // ✅ Get subaccountId from URL or account
  const subaccountId = searchParams.get('subaccount') || account?.subaccount;

  // ✅ Set the current assistant name when modal opens
  useEffect(() => {
    if (isOpen && selectedAssistant) {
      setAssistantName(selectedAssistant.name || "");
      setError(null);
    }
  }, [isOpen, selectedAssistant]);

  if (!isOpen) return null;

  const handleSave = async () => {
    // Validation
    if (!assistantName.trim()) {
      setError("Assistant name cannot be empty");
      return;
    }

    if (assistantName === selectedAssistant?.name) {
      setError("Name is the same as current name");
      return;
    }

    if (!subaccountId) {
      setError("No subaccount selected");
      return;
    }

    if (!selectedAssistant?.id) {
      setError("No assistant selected");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // ✅ Dispatch update action
      await dispatch(
        updateAssistant({
          subaccountId,
          assistantId: selectedAssistant.id,
          updateData: {
            name: assistantName.trim(),
          },
        })
      ).unwrap();

      console.log("✅ Assistant renamed successfully");
      onClose();
    } catch (err) {
      console.error("❌ Error renaming assistant:", err);
      setError(err.message || "Failed to rename assistant");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSaving) {
      handleSave();
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Rename Assistant
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Input Field) */}
        <div className="p-6 space-y-4">
          <label
            htmlFor="assistant-name"
            className="block text-sm font-medium text-gray-700"
          >
            Assistant Name
          </label>
          <input
            id="assistant-name"
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            value={assistantName}
            onChange={(e) => {
              setAssistantName(e.target.value);
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter assistant name"
            disabled={isSaving}
            autoFocus
          />

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          {/* Current Assistant Info */}
          {selectedAssistant && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-md p-2">
              <p>
                <strong>Current:</strong> {selectedAssistant.name}
              </p>
              <p>
                <strong>ID:</strong> {selectedAssistant.id.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>

        {/* Footer (Save Button) */}
        <div className="p-5 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !assistantName.trim()}
            className={`px-6 py-2 text-sm font-medium text-white rounded-md shadow-md transition-colors duration-150 ${
              isSaving || !assistantName.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {isSaving ? (
              <span className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Saving...</span>
              </span>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};