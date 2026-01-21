import React, { useState, useEffect } from "react";
import { Ban, Home, Volume2, Trash2, MessageCircle } from "lucide-react";
import TabButton from "../../components/components-ghl/TabButton";
import { useNavigate, useLocation } from "react-router-dom";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { useDispatch, useSelector } from "react-redux";
import UploadModal from "../../components/components-ghl/Knowledge/UploadModal";
import {
  fetchKnowledgeBases,
  deleteKnowledgeBase,
  getFileDetails,
} from "../../store/slices/assistantsSlice";
import { toast } from "react-hot-toast";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";

const KnowledgePage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, base: null });

  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { knowledgeBasesData = [], fetchingKnowledgeBases } = useSelector(
    (state) => state.assistants,
  );

  useEffect(() => {
    dispatch(fetchKnowledgeBases());
  }, [dispatch]);

  // const navigate = useNavigate();
  // const location = useLocation();
  // const account = useCurrentAccount();

  const handleViewContent = async (base) => {
    const fileId = base.fileIds && base.fileIds.length > 0 ? base.fileIds[0] : null;

    if (!fileId) {
      toast.error("No file associated with this knowledge base");
      return;
    }

    setIsDetailsLoading(true);
    try {
      const result = await dispatch(getFileDetails({ fileId })).unwrap();

      if (result && result.url) {
        toast.success(`Opening ${result.name || "file"}...`);

        // Open URL in new tab safely
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("File URL not found in the response");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error || "Failed to load details");
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const openDeleteModal = (e, base) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, base });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.base) {
      try {
        await dispatch(
          deleteKnowledgeBase({ toolId: deleteModal.base.id }),
        ).unwrap();
        setDeleteModal({ isOpen: false, base: null });
        toast.success("Knowledge base deleted successfully");
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const filteredBases = knowledgeBasesData.filter((base) => {
    if (activeTab === "all") return true;
    if (activeTab === "voice") return base.isVoiceEnabled;
    if (activeTab === "empty") return base.sourcesCount === 0;
    return false;
  });

  const headers = ["NAME", "UPDATED", "CREATED", "CONTENT"];

  // const handleKnowledgeClick = (base) => {
  //   if (location.pathname === "/app" && account) {
  //     const params = new URLSearchParams({
  //       agencyid: account.agencyid,
  //       subaccount: account.subaccount,
  //       route: `/knowledge/${base.id}`,
  //     });
  //     navigate(`/app?${params.toString()}`);
  //   } else {
  //     navigate(`/knowledge/${base.id}`);
  //   }
  // };

  return (
    <div className="flex-grow bg-gray-50 p-8">
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors"
        >
          + New Knowledge Base
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg shadow-sm">
        <TabButton
          isActive={activeTab === "all"}
          onClick={() => setActiveTab("all")}
        >
          All {knowledgeBasesData.length}
        </TabButton>
        <TabButton
          isActive={activeTab === "voice"}
          onClick={() => setActiveTab("voice")}
        >
          Voice 0
        </TabButton>
        <TabButton
          isActive={activeTab === "empty"}
          onClick={() => setActiveTab("empty")}
        >
          Empty 0
        </TabButton>
      </div>

      <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
        <div className="flex items-center space-x-2">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </div>
        <span className="text-gray-500">{filteredBases.length} Results</span>
      </div>

      {fetchingKnowledgeBases ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 w-10"></th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
                <th className="px-6 py-3 w-48"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBases.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <Ban className="w-8 h-8 mb-2" />
                      No knowledge to display
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBases.map((base) => (
                  <tr
                    key={base.id}
                    className=""
                    // onClick={() => handleKnowledgeClick(base)}
                  >
                    <td className="pl-3 py-2">
                      <MessageCircle className="text-gray-400" />
                    </td>
                    <td className="pl-3 py-2 text-sm font-medium text-black">
                      {base.name}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {base.updated}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-500">
                      {base.created}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleViewContent(base)}
                        disabled={isDetailsLoading}
                        className="border px-3 py-1 rounded-md text-sm hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                      >
                        {isDetailsLoading ? "Loading..." : "View Content"}
                      </button>
                    </td>
                    <td className="px-6 py-2 text-right">
                      <div
                        className="flex justify-end space-x-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className="flex items-center space-x-1 px-3 py-1 border rounded-md text-xs hover:bg-gray-100">
                          <Volume2 className="w-3 h-3 text-green-600" />
                          <span>ENABLE VOICE</span>
                        </button>

                        {/* 3. Attach the handleDelete to the button */}
                        <button
                          onClick={(e) => openDeleteModal(e, base)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
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
      )}

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.base?.name}
        onClose={() => setDeleteModal({ isOpen: false, base: null })}
        onConfirm={handleConfirmDelete}
      />

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          dispatch(fetchKnowledgeBases());
        }}
      />
    </div>
  );
};

export default KnowledgePage;
