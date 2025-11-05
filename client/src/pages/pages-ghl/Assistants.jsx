// src/pages/AssistantsPage.jsx
import React, { useState, useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { fetchAssistants } from "../../store/slices/assistantsSlice";
import TabButton from "../../components/components-ghl/TabButton";
import CreateFolderModal from "../../components/components-ghl/Assistants/CreateFolderModal";
import CreateAssistantModal from "../../components/components-ghl/Assistants/CreateAssistantModal";
import { useNavigate } from "react-router-dom";

const Assistants = ({ subaccountId = "p0JBk5SQLtFmAlkf6f7q" }) => {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: assistants, loading, error } = useSelector(
    (state) => state.assistants
  );

  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchAssistants(subaccountId));
    }
  }, [dispatch, subaccountId]);

  const headers = ["NAME", "MODEL", "UPDATED", "CREATED", "ID"];

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔍 Top Bar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for an assistant..."
                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              onClick={() => setIsFolderModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors"
            >
              + Create Folder
            </button>

            <button
              onClick={() => setIsAssistantModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors"
            >
              + Create Assistant
            </button>
          </div>
        </div>

        {/* 🗂 Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
          <TabButton
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            All {assistants.length}
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
          <span className="text-gray-400">{assistants.length}</span>
        </div>

        {/* 🧾 Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Loading assistants...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    className="px-6 py-8 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : assistants.length === 0 ? (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-gray-700" />
                        <span>{assistant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assistant.model?.model || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assistant.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assistant.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assistant.id.slice(0, 6)}...{assistant.id.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-400 hover:text-red-700 rounded-full hover:bg-red-50">
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
