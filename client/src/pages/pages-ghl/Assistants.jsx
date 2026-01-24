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
// ✅ 1. Import deleteAssistant thunk
import { fetchAssistants, deleteAssistant } from "../../store/slices/assistantsSlice";
import TabButton from "../../components/components-ghl/TabButton";
import CreateFolderModal from "../../components/components-ghl/Assistants/CreateFolderModal";
import CreateAssistantModal from "../../components/components-ghl/Assistants/CreateAssistantModal";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { importSubAccounts } from "../../store/slices/integrationSlice";
import toast from "react-hot-toast";

const Assistants = () => {
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // ✅ 3. Add state for the Delete Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, assistant: null });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const account = useCurrentAccount();

  const subaccountId = searchParams.get("subaccount") || account?.subaccount;

  const {
    data: assistants,
    loading,
    error,
  } = useSelector((state) => state.assistants);

  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchAssistants(subaccountId));
    }
  }, [dispatch, subaccountId]);

  useEffect(() => {
    if (!subaccountId) return;
    dispatch(importSubAccounts([subaccountId]))
      .unwrap()
      .then((response) => {
        if (!response.alreadyInstalled) {
          toast.success("✅ Background import: Subaccount imported successfully");
        }
      })
      .catch((err) => console.log("📥 Background import check completed:", err));
  }, [dispatch, subaccountId]);

  // ✅ 4. Open Delete Modal Handler
  const openDeleteModal = (e, assistant) => {
    e.stopPropagation(); // Stop navigation click
    setDeleteModal({ isOpen: true, assistant });
  };

  // ✅ 5. Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (deleteModal.assistant) {
      try {
        await dispatch(
          deleteAssistant({ 
            subaccountId, 
            assistantId: deleteModal.assistant.id 
          })
        ).unwrap();
        
        setDeleteModal({ isOpen: false, assistant: null });
        toast.success("Assistant deleted successfully");
      } catch (err) {
        toast.error(err || "Failed to delete assistant");
      }
    }
  };

  const handleAssistantClick = (assistant) => {
    if (location.pathname === "/app" && account) {
      const params = new URLSearchParams({
        agencyid: account.agencyid,
        subaccount: account.subaccount,
        allow: account.allow,
        myname: account.myname,
        myemail: account.myemail,
        route: `/assistants/${assistant.id}`,
      });
      navigate(`/app?${params.toString()}`);
    } else {
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
              onClick={() => setIsAssistantModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors"
            >
              + Create Assistant
            </button>
          </div>
        </div>

        {/* 🗂 Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
          <TabButton isActive={activeTab === "all"} onClick={() => setActiveTab("all")}>
            All {assistants.length}
          </TabButton>
          <TabButton isActive={activeTab === "favorites"} onClick={() => setActiveTab("favorites")}>
            Favorites 0
          </TabButton>
          <TabButton isActive={activeTab === "imported"} onClick={() => setActiveTab("imported")}>
            Imported 0
          </TabButton>
          <TabButton isActive={activeTab === "archived"} onClick={() => setActiveTab("archived")}>
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
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3"></th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
              ) : assistants.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500"><Ban className="mx-auto mb-2"/> No assistants found</td></tr>
              ) : (
                assistants.map((assistant) => (
                  <tr key={assistant.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleAssistantClick(assistant)}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <img src="https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.jpeg" alt="OpenAi" className="w-6 h-6 rounded" />
                        <span>{assistant.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{assistant.model?.model || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(assistant.updatedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(assistant.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{assistant.id.slice(0, 6)}...</td>
                    <td className="px-6 py-3 text-right">
                      {/* ✅ 6. Update Button to trigger Modal */}
                      <button
                        onClick={(e) => openDeleteModal(e, assistant)}
                        className="p-1 text-red-400 bg-red-100 rounded-md hover:bg-red-400 hover:text-red-50 duration-75"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ 7. Add ConfirmDeleteModal to the UI */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.assistant?.name}
        onClose={() => setDeleteModal({ isOpen: false, assistant: null })}
        onConfirm={handleConfirmDelete}
      />

      <CreateFolderModal isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)} />
      <CreateAssistantModal isOpen={isAssistantModalOpen} onClose={() => setIsAssistantModalOpen(false)} />
    </div>
  );
};

export default Assistants;