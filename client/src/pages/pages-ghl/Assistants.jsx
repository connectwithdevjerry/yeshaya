// src/pages/pages-ghl/Assistants.jsx
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
  MoreHorizontal,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssistants } from "../../store/slices/assistantsSlice";
import TabButton from "../../components/components-ghl/TabButton";
import CreateFolderModal from "../../components/components-ghl/Assistants/CreateFolderModal";
import CreateAssistantModal from "../../components/components-ghl/Assistants/CreateAssistantModal";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { importSubAccounts } from "../../store/slices/integrationSlice";

const Assistants = () => {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const account = useCurrentAccount();

  // ✅ Get subaccountId from URL or current account
  const subaccountId = searchParams.get("subaccount") || account?.subaccount;

  const {
    data: assistants,
    loading,
    error,
  } = useSelector((state) => state.assistants);

  useEffect(() => {
    if (subaccountId) {
      console.log("📍 Fetching assistants for subaccount:", subaccountId);
      dispatch(fetchAssistants(subaccountId));
    } else {
      console.warn("⚠️ No subaccountId found");
    }
  }, [dispatch, subaccountId]);

  useEffect(() => {
    if (!subaccountId) return;
    console.log("📥 Importing subaccounts for subaccountId:", subaccountId);
    (async () => {
      try {
        dispatch(importSubAccounts(subaccountId))
          .unwrap()
          .then(() => {
            console.log("Subaccounts imported successfully");
          })
          .catch((err) => {
            console.error("Import failed:", err);
          });
      } catch (err) {
        console.warn("📥 importSubAccounts failed (background):", err);
      }
    })();
  }, [dispatch, subaccountId]);

  // ✅ Handle assistant click with account context
  const handleAssistantClick = (assistant) => {
    if (location.pathname === "/app" && account) {
      // Navigate with account context
      const params = new URLSearchParams({
        agencyid: account.agencyid,
        subaccount: account.subaccount,
        allow: account.allow,
        myname: account.myname,
        myemail: account.myemail,
        route: `/assistants/${assistant.id}`,
      });
      console.log(
        "📍 Navigating to assistant with account context:",
        `/app?${params.toString()}`
      );
      navigate(`/app?${params.toString()}`);
    } else {
      // Regular navigation
      navigate(`/assistants/${assistant.id}`);
    }
  };

  const headers = ["NAME", "MODEL", "UPDATED", "CREATED", "ID"];

  return (
    <div className="flex-grow bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 🔍 Top Bar */}
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-3">
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
        </div>

        {/* 🧾 Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y border divide-gray-200">
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
                <th className=" px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
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
                    onClick={() => handleAssistantClick(assistant)}
                  >
                    <td className="px-1 py-1 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-1">
                        <img
                          src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg"
                          alt="OpenAi"
                          className="w-[25px]"
                        />
                        <span>{assistant.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                      {assistant.model?.model || "N/A"}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assistant.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(assistant.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {assistant.id.slice(0, 6)}...{assistant.id.slice(-4)}
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle more options
                          }}
                          className="p-1 text-gray-400 hover:text-gray-100 rounded-md bg-gray-100 hover:bg-gray-300"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle delete
                          }}
                          className="p-1 text-red-400 bg-red-100 rounded-md hover:bg-red-400 hover:text-red-50 duration-75"
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
