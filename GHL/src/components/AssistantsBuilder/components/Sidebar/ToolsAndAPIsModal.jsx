// src/components/assistant/ToolsAndAPIsModal.jsx
import React, { useState } from "react";
import {
  X,
  Info,
  Layers,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Database,
  Tag,
  ArrowRight,
  Filter,
  Zap,
} from "lucide-react";

// --- Reusable Tool Card ---
const ToolCard = ({ title, description, icon: Icon }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-between hover:shadow-sm transition">
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-blue-600" />
          <h5 className="font-medium text-gray-800">{title}</h5>
        </div>
        <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
    </div>
    <button className="w-full py-2 px-3 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition">
      Add to assistant
    </button>
  </div>
);

// --- Tool Category Section ---
const ToolCategory = ({ title, tools, deprecated = false }) => (
  <div className="mb-8">
    <div className="flex items-center space-x-2 mb-3">
      {deprecated && (
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
          Deprecated
        </span>
      )}
      <h4 className="text-base font-semibold text-gray-800">{title}</h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool, index) => (
        <ToolCard key={index} {...tool} />
      ))}
    </div>
  </div>
);

// --- Tabs ---
const tabs = [
  "Platform",
  "Extraction",
  "Transfer call",
  "Add tag",
  "Remove tag",
  "Custom",
];

// --- Dynamic Dummy Data Generator ---
const generateDummyTools = (categoryName, icons) =>
  Array.from({ length: 3 }, (_, i) => ({
    title: `${categoryName} Tool ${i + 1}`,
    description: `This is a sample description for ${categoryName} Tool ${i + 1}. It dynamically changes for demonstration.`,
    icon: icons[i % icons.length],
  }));

const platformToolsData = {
  categories: [
    {
      title: "Interaction Creation",
      tools: generateDummyTools("Interaction Creation", [Layers, Mail, Zap]),
    },
    {
      title: "Channel Switching",
      tools: generateDummyTools("Channel Switching", [Phone, Mail, ExternalLink]),
    },
    {
      title: "Calendar Management",
      tools: generateDummyTools("Calendar Management", [Calendar, ExternalLink, Database]),
    },
    {
      title: "Information Collection",
      tools: generateDummyTools("Information Collection", [Database, Filter, Tag]),
    },
  ],
};

export const ToolsAndAPIsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("Platform");

  if (!isOpen) return null;

  const renderTabContent = () => {
    const data = platformToolsData;

    if (activeTab === "Platform") {
      return (
        <div className="p-6 pt-0 overflow-y-auto max-h-[calc(80vh-160px)] custom-scrollbar">
          {data.categories.map((category, index) => (
            <ToolCategory key={index} {...category} />
          ))}
        </div>
      );
    }

    // For non-Platform tabs, show placeholder dynamic content
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="mb-2 text-sm">
          Dynamic content for <strong>{activeTab}</strong> tab
        </p>
        <p className="text-xs text-gray-400">More tools coming soon...</p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Add Tools & APIs
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar-horizontal">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } transition-colors duration-200`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden">{renderTabContent()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Editing New Blank Assistant
          </span>
          <div className="flex space-x-3">
            <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">
              <span className="flex items-center space-x-2">
                <Layers className="w-4 h-4" /> <span>Import Tool ID</span>
              </span>
            </button>
            <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
              <span className="flex items-center space-x-2">
                <ArrowRight className="w-4 h-4" /> <span>Create New Tool</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
