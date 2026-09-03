// src/components/components-ghl/AssistantsBuilder/components/AssistantSidebar.jsx
import React, { useState, useEffect } from "react";
import { ChevronRight, X, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toolkitItems, bottomMenuItem } from "../data/ToolKitData";
import { ChatSettingsPanel } from "./Sidebar/ChatSettingsPanel";
import { CallSettingsPanel } from "./Sidebar/CallSettingsPanel";
import { ToolsAndAPIsModal } from "./Sidebar/ToolsAndAPIsModal";
import { CalendarModal } from "./Sidebar/CalendarModal";
import { KnowledgeBaseSettings } from "./Sidebar/KnowledgeBaseSettings";
import { MapCustomFieldsPanel } from "./Sidebar/MapCustomFieldsPanel";
import { FindReplacePanel } from "./Sidebar/FindReplacePanel";
import { TeamNotesPanel } from "./Sidebar/TeamNotesPanel";

const ToolkitItem = ({ item, isSelected, onSelect, openToolsModal, openCalendarModal, promptContent, setPromptContent }) => {
  const Icon = item.icon;

  const handleClick = () => {
    if (item.title === "Tools & APIs") {
      openToolsModal();
    } else if (item.title === "Calendars") {
      openCalendarModal();
    } else if (item.type === "panel") {
      onSelect(item.title);
    }
  };

  const renderPanel = () => {
    if (item.title === "Chat Settings")           return <ChatSettingsPanel />;
    if (item.title === "Call Settings")           return <CallSettingsPanel />;
    if (item.title === "Knowledge Base Settings") return <KnowledgeBaseSettings />;
    if (item.title === "Map Custom Fields")       return <MapCustomFieldsPanel />;
    if (item.title === "Find & Replace")          return <FindReplacePanel promptContent={promptContent} setPromptContent={setPromptContent} />;
    if (item.title === "Team Notes")              return <TeamNotesPanel />;
    return null;
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <motion.div
        whileHover={{ x: 2 }}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 ${
          isSelected && item.type === "panel"
            ? "bg-indigo-50/60"
            : "hover:bg-gray-50"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
            isSelected && item.type === "panel"
              ? "bg-indigo-100"
              : "bg-gray-100"
          }`}>
            <Icon className={`w-3.5 h-3.5 transition-colors ${
              isSelected && item.type === "panel"
                ? "text-indigo-600"
                : "text-gray-500"
            }`} />
          </div>
          <span className={`text-sm font-medium transition-colors ${
            isSelected && item.type === "panel"
              ? "text-indigo-700"
              : "text-gray-700"
          }`}>
            {item.title}
          </span>
        </div>

        {item.type === "panel" && (
          <motion.div
            animate={{ rotate: isSelected ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className={`w-4 h-4 transition-colors ${
              isSelected ? "text-indigo-500" : "text-gray-300"
            }`} />
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isSelected && item.type === "panel" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden bg-white border-t border-indigo-50"
          >
            <div className="w-[250px]">{renderPanel()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ToolkitSidebar = ({ isOpen, onToggle, activeTab, promptContent, setPromptContent }) => {
  const [expandedItem,       setExpandedItem]       = useState(null);
  const [isToolsModalOpen,   setIsToolsModalOpen]   = useState(false);
  const [isCalendarModalOpen,setIsCalendarModalOpen]= useState(false);

  const handleItemSelect = (title) => setExpandedItem((prev) => (prev === title ? null : title));

  useEffect(() => {
    if (activeTab !== "Builder" && isOpen) {
      onToggle(false);
      setExpandedItem(null);
    }
  }, [activeTab, isOpen, onToggle]);

  const BottomIcon = bottomMenuItem?.icon;

  return (
    <div
      className={`max-h-full border-l border-gray-100 bg-white flex-shrink-0 flex flex-col relative transition-all duration-300 ease-in-out ${
        isOpen ? "w-[300px]" : "w-0 overflow-hidden"
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Wrench className="w-3.5 h-3.5 text-white" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Toolkit</h4>
              </div>
              <button
                onClick={() => onToggle(false)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Close Toolkit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Item list */}
            <div className="flex-1 overflow-y-auto">
              {toolkitItems.map((item) => (
                <ToolkitItem
                  key={item.title}
                  item={item}
                  isSelected={expandedItem === item.title}
                  onSelect={handleItemSelect}
                  openToolsModal={() => setIsToolsModalOpen(true)}
                  openCalendarModal={() => setIsCalendarModalOpen(true)}
                  promptContent={promptContent}
                  setPromptContent={setPromptContent}
                />
              ))}
            </div>

            {/* Bottom item */}
            {bottomMenuItem && (
              <div className="p-3 border-t border-gray-100 sticky bottom-0 bg-white">
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer ${bottomMenuItem.bgColor} ${bottomMenuItem.hoverBg} transition-colors duration-150`}
                >
                  {BottomIcon && (
                    <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                      <BottomIcon className={`w-3.5 h-3.5 ${bottomMenuItem.textColor}`} />
                    </div>
                  )}
                  <span className="text-sm font-medium text-rose-700">
                    {bottomMenuItem.title}
                  </span>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ToolsAndAPIsModal isOpen={isToolsModalOpen}    onClose={() => setIsToolsModalOpen(false)} />
      <CalendarModal     isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} />
    </div>
  );
};
