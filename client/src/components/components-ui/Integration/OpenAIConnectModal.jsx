import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectOpenAI } from "../../../store/slices/integrationSlice";

const ConnectOpenAIModal = ({ onClose, isOpen }) => {
  const [apiKey, setApiKey] = useState("");
  const dispatch = useDispatch();
  const { loading, error, connected, message } = useSelector(
    (state) => state.integrations.openAI
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(connectOpenAI(apiKey));
  };

  // useEffect(() => {
  //   if (connected && !loading && !error) {
  //     onClose(); 
  //   }
  // }, [connected, loading, error, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Connect OpenAI</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your OpenAI API Key
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-sky-400 outline-none"
          />

          {/* 🚨 Display backend error message */}
          {error && (
            <p className="text-red-600 text-sm mt-2">
              {typeof error === "string" ? error : error.message}
            </p>
          )}

          {connected && !error && (
            <p className="text-green-600 text-sm mt-2">{message}</p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:bg-sky-400"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectOpenAIModal;
