// src/pages/AssistantsPage.jsx
import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  Home,
  Trash2,
  MoreVertical,
  Settings,
} from "lucide-react";
import TabButton from "../components/TabButton";
import CreateFolderModal from "../components/Assistants/CreateFolderModal";
import CreateAssistantModal from "../components/Assistants/CreateAssistantModal";
import {useNavigate} from 'react-router-dom';

// Dummy data
const DUMMY_ASSISTANTS_DATA = [
  {
    name: "New Blank Assistant",
    meta: "GPT-4o",
    updated: "Oct 28, 2025 11:31 pm",
    created: "Oct 21, 2025 3:24 pm",
    id: "1761...9400",
    icon: Settings,
  },
  {
    name: "Sarah Livechat, SMS...",
    meta: "GPT-4o",
    updated: "Oct 21, 2025 4:33 pm",
    created: "Oct 7, 2025 2:14 pm",
    id: "1759...9200",
    icon: Settings,
  },
  {
    name: "Sarah",
    meta: "GPT-4o",
    updated: "Oct 21, 2025 4:30 pm",
    created: "Oct 7, 2025 1:52 pm",
    id: "1759...6500",
    icon: Settings,
  },
];

const Assistants = () => {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const assistants = DUMMY_ASSISTANTS_DATA;
  const totalResults = assistants.length;

  const headers = ["NAME", "META DATA", "UPDATED", "CREATED", "ID"];

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for an assistant..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            {/* Create Buttons */}
            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
            >
              + Create Folder
            </button>

            <button
              onClick={() => setIsAssistantModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
            >
              + Create Assistant
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
          <TabButton
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            All {totalResults}
          </TabButton>
          <TabButton
            isActive={activeTab === "favorites"}
            onClick={() => setActiveTab("favorites")}
          >
            Favorites 0
          </TabButton>
          <TabButton
            isActive={activeTab === "imported"}
            onClick={() => setActiveTab("imported")}
          >
            Imported 0
          </TabButton>
          <TabButton
            isActive={activeTab === "archived"}
            onClick={() => setActiveTab("archived")}
          >
            Archived 0
          </TabButton>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm font-medium text-gray-600 mb-4 flex items-center space-x-2">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-400">{totalResults}</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {assistants.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Ban className="w-8 h-8 text-gray-400 mb-2" />
                      No assistants to display
                    </div>
                  </td>
                </tr>
              ) : (
                assistants.map((assistant) => (
                  <tr
                    key={assistant.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/assistants/${assistant.id}`)}
                  >
                    {/* NAME */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        {React.createElement(assistant.icon, {
                          className: "w-5 h-5 text-gray-700",
                        })}
                        <span>{assistant.name}</span>
                      </div>
                    </td>

                    {/* META DATA */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assistant.meta}
                    </td>

                    {/* UPDATED */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assistant.updated}
                    </td>

                    {/* CREATED */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assistant.created}
                    </td>

                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assistant.id}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
                          title="More"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-red-400 hover:text-red-700 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option>10</option>
              </select>
            </div>
            <span>Showing 1-10</span>
            <span className="font-medium text-gray-500">
              {totalResults} Results
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm">
            <div className="text-gray-500">Page 1 of 1</div>
            <button
              className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={totalResults <= 10}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={totalResults <= 10}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
      <CreateAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
      />
    </div>
  );
};

export default Assistants;
