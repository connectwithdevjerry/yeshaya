import React from "react";
import { useState } from "react";
import { Info, Plus, Mail, Trash2, ExternalLink, X } from "lucide-react";

export const CollabSessionDropdown = ({ isOpen, onClose }) => {
  const [allowAll, setAllowAll] = useState(false);
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Collab Session</h3>
            <p className="text-[10px] text-gray-400">
              Expires at 12/04/25 11:22 pm
            </p>
          </div>
          <Info size={16} className="text-gray-300 cursor-help" />
        </div>

        <div className="p-4 space-y-4">
          {/* Toggle Section */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-600">
                Allow all to view
              </span>
              <Info size={14} className="text-gray-300" />
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={allowAll}
                onChange={() => setAllowAll(!allowAll)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* User Input Section */}
          {!allowAll && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-800">
                  Authorized users
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="user@gmail.com..."
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button className="p-1.5 border border-gray-200 rounded-md hover:bg-gray-50">
                    <Plus size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {/* User List */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Mail size={14} />
                  <span className="text-xs">kverlus@mit.edu</span>
                </div>
                <button className="p-1 text-red-200 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Collab Link Card */}
          <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white border border-indigo-100 rounded-md">
                <ExternalLink size={16} className="text-indigo-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">
                  Collab Link
                </span>
                <span className="text-[10px] text-gray-400 truncate w-24">
                  .../session/176488...
                </span>
              </div>
            </div>
            <button className="px-3 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100">
              Copy
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-xs font-bold text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
          <button className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-md hover:bg-red-100">
            Delete Session
          </button>
        </div>
      </div>
    </>
  );
};
