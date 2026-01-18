import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  X,
  Info,
  Layers,
  Globe,
  Calendar,
  Search,
  UserRound,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { addToolToAssistant } from "../../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

// --- Reusable Tool Card ---
const ToolCard = ({ title, description, onAdd, isLoading }) => {
  // ✅ FIX: Defensive check to prevent destructuring/rendering errors if tool data is missing
  if (!title) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group">
      <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <Info className="w-4 h-4" />
      </button>

      <div>
        <div className="flex flex-col mb-4">
          <h5 className="font-bold text-gray-900 text-lg mb-2">{title}</h5>
          {/* ✅ FIX: Fallback for missing description */}
          <p className="text-sm text-gray-500 leading-relaxed min-h-[60px]">
            {description || "No description available for this tool."}
          </p>
        </div>
      </div>
      
      <button 
        onClick={onAdd}
        disabled={isLoading}
        className="w-full py-2.5 px-4 text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-100 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to assistant"}
      </button>
    </div>
  );
};

// --- Tool Category Section ---
const ToolCategory = ({ title, icon: CategoryIcon, tools, onAddTool, activeToolLoading }) => {
  // ✅ FIX: Ensure tools is an array and filter out any undefined/null entries before mapping
  const validTools = (tools || []).filter(tool => tool && typeof tool === 'object');

  if (validTools.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center space-x-2 mb-6">
        {CategoryIcon && <CategoryIcon className="w-5 h-5 text-gray-400" />}
        <h4 className="text-base font-medium text-gray-600">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {validTools.map((tool, index) => (
          <ToolCard 
            key={tool.title || index} 
            {...tool} 
            onAdd={() => onAddTool(tool.title)}
            isLoading={activeToolLoading === tool.title}
          />
        ))}
      </div>
    </div>
  );
};

const tabs = ["Platform", "Extraction", "Transfer call", "Add tag", "Remove tag", "Custom"];

const platformToolsData = [
  {
    title: "Information Collection",
    icon: Info,
    tools: [
      { title: "Scrape Website", description: "Allows the AI to look at a website. You can prompt the website to scrape or use the contact's website in your instructions.", icon: Globe },
      { title: "Update User Details", description: "Updates the contact's information in the CRM. The fields that can be updated using this tool are first name, last name, email, phone number, full address, timezone and website.", icon: UserRound },
      { title: "Search The Web", description: "Searches the web and returns search engine answers to a query. Use this tool to search the web.", icon: Search },
    ],
  },
  {
    title: "Calendar Management",
    icon: Calendar,
    tools: [
      { title: "Get Availability", description: "Gets your calendar availability. Always call this tool to get the most up-to-date information about your calendar ID's availability.", icon: Calendar },
      { title: "Book Appointment", description: "Books an appointment with the user. Always get your availability before using this tool to confirm the chosen spot is still available before proceeding to book. Use this tool to book an appointment from an available...", icon: Calendar },
      { title: "Get User Calendar Events", description: "Gets all calendar events schedule with the user and data associated. Use this tool to check the user's current, past and future appointments and get appointment IDs for the events.", icon: Calendar },
    ],
  },
];

export const ToolsAndAPIsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("Platform");
  const [loadingToolTitle, setLoadingToolTitle] = useState(null);

  const assistantId = getAssistantIdFromUrl(searchParams);

  const handleAddTool = async (toolTitle) => {
    if (!assistantId) {
      toast.error("No active assistant found");
      return;
    }

    const toolMapping = {
      "Scrape Website": "scrape_website",
      "Update User Details": "update_user_details",
      "Search The Web": "web_search",
      "Get Availability": "get_availability",
      "Book Appointment": "book_appointment",
      "Get User Calendar Events": "get_calendar_events",
    };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-[#FAFAFA] rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[92vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-white px-8 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Add Tools & APIs</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="flex space-x-8 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`pb-2 text-sm font-medium transition-all relative ${
                  activeTab === tab ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center">
          <div className="flex space-x-6">
            <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-1">Main</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          {activeTab === "Platform" ? (
            platformToolsData.map((group, index) => (
              <ToolCategory 
                key={index} 
                {...group} 
                onAddTool={handleAddTool} 
                activeToolLoading={loadingToolTitle} 
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Layers className="w-12 h-12 mb-2 opacity-20" />
              <p>No tools found for {activeTab}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-white border-t border-gray-100 flex justify-end items-center space-x-4">
          <button className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
            <Layers className="w-4 h-4" />
            <span>Import Tool ID</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition">
            <span>Create New Tool</span>
          </button>
        </div>
      </div>
    </div>
  );
};