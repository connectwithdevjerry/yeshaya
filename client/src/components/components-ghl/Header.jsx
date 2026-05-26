import React from "react";
import { useState } from "react";
import { Search, Link2 } from "lucide-react";
import { CheckCircle, Bell } from "lucide-react";
import OauthConnectionPopup from "./OauthConnection";
import { AnimatePresence, motion } from "framer-motion";

export function Header({ title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePopup, setActivePopup] = useState();
  const hasNotifications = false;

  const togglePopup = (popupName) => {
    setActivePopup(activePopup === popupName ? null : popupName);
  };

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>
          <button
            className="p-2 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 relative"
            onClick={() => togglePopup("oauth")}
          >
            <Link2 className="w-5 h-5" />
          </button>
          <button
            className="relative p-2 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="w-5 h-5" />
            {!hasNotifications && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                0
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {activePopup === 'oauth' && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-20 top-full mt-1 z-50"
          >
            <OauthConnectionPopup onClose={() => setActivePopup(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full right-4 mt-1 z-50 w-80 bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Notification Center</h3>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-base">
                You're all caught up{" "}
                <span role="img" aria-label="smiling emoji">🥳</span>
              </p>
            </div>

            <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50/60">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
