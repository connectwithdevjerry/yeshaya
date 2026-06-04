// src/components/assistant/ToolsAndAPIsModal.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  X, Info, Layers, Globe, Calendar, Search,
  UserRound, ArrowRight, Loader2, Plus, Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addToolToAssistant } from "../../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

// ── Tool card ────────────────────────────────────────────────────────────────
const ToolCard = ({ title, description, onAdd, isLoading }) => {
  if (!title) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-gray-200 transition-all relative group"
    >
      <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors">
        <Info className="w-3.5 h-3.5" />
      </button>

      <div className="mb-5 pr-6">
        <h5 className="font-bold text-gray-900 text-sm mb-1.5">{title}</h5>
        <p className="text-xs text-gray-400 leading-relaxed min-h-[48px]">
          {description || "No description available for this tool."}
        </p>
      </div>

      <button
        onClick={onAdd}
        disabled={isLoading}
        className="w-full py-2 px-4 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <><Plus className="w-3 h-3" /> Add to assistant</>
        }
      </button>
    </motion.div>
  );
};

// ── Category section ──────────────────────────────────────────────────────────
const ToolCategory = ({ title, icon: Icon, tools, onAddTool, activeToolLoading }) => {
  const valid = (tools || []).filter((t) => t && typeof t === "object");
  if (valid.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {Icon && (
          <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        )}
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {valid.map((tool, i) => (
          <ToolCard
            key={tool.title || i}
            {...tool}
            onAdd={() => onAddTool(tool.title)}
            isLoading={activeToolLoading === tool.title}
          />
        ))}
      </div>
    </div>
  );
};

// ── Data ──────────────────────────────────────────────────────────────────────
const tabs = ["Platform", "Extraction", "Transfer call", "Add tag", "Remove tag", "Custom"];

const platformToolsData = [
  {
    category: "Platform",
    title: "Information Collection",
    icon: Info,
    tools: [
      { title: "Scrape Website",     description: "Allows the AI to look at a website. You can prompt the website to scrape or use the contact's website in your instructions.", icon: Globe },
      { title: "Update User Details", description: "Updates the contact's information in the CRM. Fields: first name, last name, email, phone, address, timezone and website.", icon: UserRound },
      { title: "Search The Web",     description: "Searches the web and returns search engine answers to a query.", icon: Search },
    ],
  },
  {
    category: "Platform",
    title: "Calendar Management",
    icon: Calendar,
    tools: [
      { title: "Get Availability",          description: "Gets your calendar availability. Always call this first to confirm the chosen slot is still available.",                                         icon: Calendar },
      { title: "Book Appointment",          description: "Books an appointment. Always check availability before using this tool to confirm the slot is available before proceeding.",                     icon: Calendar },
      { title: "Get User Calendar Events",  description: "Gets all calendar events scheduled with the user. Use this to check current, past and future appointments and retrieve appointment IDs.",       icon: Calendar },
    ],
  },
  {
    category: "Extraction",
    title: "Data Extraction",
    icon: Layers,
    tools: [
      { title: "Search The Web", description: "Searches the web and returns search engine answers to a query.", icon: Search },
    ],
  },
  {
    category: "Transfer call",
    title: "Telephony Tools",
    icon: ArrowRight,
    tools: [],
  },
];

const toolMapping = {
  "Scrape Website":           "scrape_website",
  "Update User Details":      "update_user_details",
  "Search The Web":           "search_the_web",
  "Get Availability":         "check_availability",
  "Book Appointment":         "book_appointment",
  "Get User Calendar Events": "get_user_calendar_events",
  "Live Transfer":            "live_transfer",
  "Extract PDF":              "extract_pdf",
};

// ── Modal ─────────────────────────────────────────────────────────────────────
export const ToolsAndAPIsModal = ({ isOpen, onClose }) => {
  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const [activeTab,          setActiveTab]          = useState("Platform");
  const [loadingToolTitle,   setLoadingToolTitle]   = useState(null);

  const assistantId  = getAssistantIdFromUrl(searchParams);
  const filteredData = platformToolsData.filter((g) => g.category === activeTab);

  const handleAddTool = async (toolTitle) => {
    if (!assistantId) { toast.error("No active assistant found"); return; }
    const toolName = toolMapping[toolTitle];
    if (!toolName) return;
    setLoadingToolTitle(toolTitle);
    try {
      await dispatch(addToolToAssistant({ assistantId, toolName })).unwrap();
      toast.success(`${toolTitle} added successfully`);
    } catch (err) {
      toast.error(err || "Failed to add tool");
    } finally {
      setLoadingToolTitle(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Tools & APIs</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Extend your assistant with powerful capabilities</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 pt-4 pb-0 border-b border-gray-100 flex-shrink-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 px-3 text-xs font-semibold whitespace-nowrap transition-all relative ${
                    activeTab === tab
                      ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500 after:rounded-t-full"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50/40">
              {filteredData.length > 0 ? (
                filteredData.map((group, i) => (
                  <ToolCategory
                    key={i}
                    {...group}
                    onAddTool={handleAddTool}
                    activeToolLoading={loadingToolTitle}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Layers className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">No tools yet</p>
                    <p className="text-xs text-gray-400 mt-0.5">No tools configured for the "{activeTab}" category.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end items-center gap-3 flex-shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">
                <Layers className="w-3.5 h-3.5" /> Import Tool ID
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Tool
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
