// src/components/assistant/ToolkitSidebar.jsx
import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, X, Settings } from "lucide-react";
import { toolkitItems, bottomMenuItem } from "../data/ToolKitData";
import { ChatSettingsPanel } from "./Sidebar/ChatSettingsPanel";
import { CallSettingsPanel } from "./Sidebar/CallSettingsPanel";
import { ToolsAndAPIsModal } from "./Sidebar/ToolsAndAPIsModal";
import { CalendarModal } from "./Sidebar/CalendarModal";

const ToolkitItem = ({ item, isSelected, onSelect, openToolsModal, openCalendarModal }) => {
  const Icon = item.icon;

  const handleClick = () => {
    if (item.title === "Tools & APIs") {
      openToolsModal(); // ✅ Opens modal for 'Tools & APIs'
    } else if (item.title === "Calendars") {
      openCalendarModal();
    } else if (item.type === "panel") {
      onSelect(item.title); // Expand panel content
    }
  };

  const renderPanel = () => {
    if (item.title === "Chat Settings") return <ChatSettingsPanel />;
    if (item.title === "Call Settings") return <CallSettingsPanel />;
    return null;
  };

  return (
    <div className="border-b border-gray-100">
      {/* Item Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
        onClick={handleClick}
      >
        <div className="flex items-center space-x-3">
          <Icon
            className={`w-5 h-5 ${
              isSelected && item.type === "panel"
                ? "text-blue-600"
                : "text-gray-500"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              isSelected && item.type === "panel"
                ? "text-blue-700"
                : "text-gray-800"
            }`}
          >
            {item.title}
          </span>
        </div>

        {item.type === "panel" && (
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              isSelected ? "rotate-90 text-blue-600" : "text-gray-400"
            }`}
          />
        )}
      </div>

      {/* Expandable content */}
      {isSelected && item.type === "panel" && (
        <div className="overflow-hidden w-[250px] bg-white">{renderPanel()}</div>
      )}
    </div>
  );
};

export const ToolkitSidebar = ({ isOpen, onToggle, activeTab }) => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const sidebarWidth = "w-[300px]";

  const handleItemSelect = (title) => {
    setExpandedItem((prev) => (prev === title ? null : title));
  };

  const openToolsModal = () => {
    setIsToolsModalOpen(true);
  };

  const closeToolsModal = () => {
    setIsToolsModalOpen(false);
  };

  // 🧠 Close sidebar automatically when switching away from Builder
  useEffect(() => {
    if (activeTab !== "Builder" && isOpen) {
      onToggle(false);
      setExpandedItem(null);
    }
  }, [activeTab, isOpen, onToggle]);

  return (
    <div
      className={`max-h-full border-l border-gray-200 bg-white flex-shrink-0 flex flex-col relative transition-all duration-300 ease-in-out ${
        isOpen ? sidebarWidth : "w-0 overflow-hidden"
      }`}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200  flex justify-between items-center sticky top-0 bg-white z-10">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Tool Kit</span>
            </h4>

            <button
              onClick={() => onToggle(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              title="Hide Toolkit"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-1">
            {toolkitItems.map((item) => (
              <ToolkitItem
                key={item.title}
                item={item}
                isSelected={expandedItem === item.title}
                onSelect={handleItemSelect}
                openToolsModal={openToolsModal} 
                openCalendarModal={() => setIsCalendarModalOpen(true)}
              />
            ))}
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <div
              className={`flex items-center justify-between p-2 cursor-pointer ${bottomMenuItem.bgColor} ${bottomMenuItem.hoverBg} rounded-md transition-colors duration-150`}
            >
              <div className="flex items-center space-x-3">
                <bottomMenuItem.icon
                  className={`w-5 h-5 ${bottomMenuItem.textColor}`}
                />
                <span className="text-sm font-medium text-red-800">
                  {bottomMenuItem.title}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toggle Button (only for Builder tab) */}
      {!isOpen && activeTab === "Builder" && (
        <button
          onClick={() => onToggle(true)}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 -ml-3 z-10 p-1 bg-white border border-gray-300 rounded-full shadow-md text-gray-500 hover:text-blue-600 transition"
          title="Show Toolkit"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* ✅ Tools & APIs Modal */}
      <ToolsAndAPIsModal isOpen={isToolsModalOpen} onClose={closeToolsModal} />
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} />
    </div>
  );
};
