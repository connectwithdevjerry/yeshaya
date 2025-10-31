import React from "react";
import { useState } from "react";
import { Search, Link2, ShoppingBag } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { Bell } from "lucide-react";
import OauthConnectionPopup from "./OauthConnection";

export function Header({ title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePopup, setActivePopup] = useState();
  const hasNotifications = false;

  const togglePopup = (popupName) => {
    setActivePopup(activePopup === popupName ? null : popupName);
  };

  return (
    <div className="bg-white border-b  border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors mr-2 relative"
            onClick={() => togglePopup("oauth")}
          >
            <Link2 className="w-5 h-5" />
            {/* Optional: Add a connection status indicator here if needed */}
          </button>
          <button
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="w-5 h-5" />
            {!hasNotifications && ( // Display 0 count only if no actual notifications for consistency with image
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                0
              </span>
            )}
          </button>
        </div>
      </div>

      {activePopup === 'oauth' && (
        <div className="absolute right-20">
          <OauthConnectionPopup onClose={() => setActivePopup(null)} />
        </div>
      )}

      {isOpen && (
        <div className="absolute top-16 right-4 z-50 w-80 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Notification Center
            </h3>
            <button className="text-gray-400 hover:text-gray-600">
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content - "You're all caught up" */}
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-base">
              You're all caught up{" "}
              <span role="img" aria-label="smiling emoji">
                🥳
              </span>
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
