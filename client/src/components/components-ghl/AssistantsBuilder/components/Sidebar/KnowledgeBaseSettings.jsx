import React, { useEffect, useState } from "react";
import { ChevronDown, Database, X, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmDeleteModal from "../../../ConfirmDeleteModal";
import {
  fetchKnowledgeBases,
  fetchAssistantKnowledgeBases,
  linkKnowledgeBaseToAssistant,
  removeKnowledgeBaseFromAssistant,
} from "../../../../../store/slices/assistantsSlice";
import toast from "react-hot-toast";

export const KnowledgeBaseSettings = () => {
  const dispatch = useDispatch();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKBToDelete, setSelectedKBToDelete] = useState(null);

  const {
    selectedAssistant,
    knowledgeBasesData,
    currentAssistantKBs,
    fetchingKnowledgeBases,
    fetchingAssistantKBs,
    linkingKnowledgeBase,
  } = useSelector((state) => state.assistants);

  const assistantId = selectedAssistant?.id || selectedAssistant?.assistantId;

  useEffect(() => {
    if (knowledgeBasesData.length === 0 && !fetchingKnowledgeBases) {
      dispatch(fetchKnowledgeBases());
    }

    if (assistantId && !fetchingAssistantKBs) {
      dispatch(fetchAssistantKnowledgeBases(assistantId));
    }
  }, [dispatch, assistantId]);


  const availableBases = React.useMemo(() => {
    return knowledgeBasesData.filter(
      (kb) => !currentAssistantKBs.some((connected) => connected.id === kb.id)
    );
  }, [knowledgeBasesData, currentAssistantKBs]);

  // Action Handlers
  const handleConnect = async (toolId) => {
    if (!assistantId || !toolId) return;
    try {
      await dispatch(
        linkKnowledgeBaseToAssistant({ assistantId, toolId })
      ).unwrap();
      dispatch(fetchAssistantKnowledgeBases(assistantId));
    } catch (error) {
      console.error("Link error:", error);
    }
  };

  const handleUnlink = (toolId) => {
    if (!assistantId || !toolId) return;
    setSelectedKBToDelete(toolId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!assistantId || !selectedKBToDelete) return;

    try {
      await dispatch(
        removeKnowledgeBaseFromAssistant({
          assistantId,
          toolId: selectedKBToDelete,
        })
      ).unwrap();
      dispatch(fetchAssistantKnowledgeBases(assistantId));
    } catch (error) {
      console.error("Unlink error:", error);
    } finally {
      toast.success("Knowledge base disconnected successfully");
      setShowDeleteModal(false);
      setSelectedKBToDelete(null);
    }
  };

  if (!assistantId) {
    return (
      <div className="p-4 text-xs text-gray-500 italic">
        Please select an assistant to configure knowledge.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-5">
        <div className="border-b border-gray-200 pb-4">
          <h5 className="text-sm font-semibold text-gray-800 mb-2">
            Knowledge Setting
          </h5>
          <p className="text-xs text-gray-500">
            Configure settings to connect your knowledge bases with the
            assistant.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex justify-between items-center">
            Connect New Source
            {linkingKnowledgeBase && (
              <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
            )}
          </label>
          <div className="relative">
            <select
              onChange={(e) => handleConnect(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              value=""
              disabled={fetchingKnowledgeBases || linkingKnowledgeBase}
            >
              <option value="" disabled>
                {fetchingKnowledgeBases
                  ? "Loading..."
                  : "Select a knowledge base..."}
              </option>
              {availableBases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Connected List */}
        <div className="space-y-3">
          <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Connected ({currentAssistantKBs.length})</span>
            {fetchingAssistantKBs && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
          </h6>

          {currentAssistantKBs.length === 0 && !fetchingAssistantKBs ? (
            <p className="text-xs italic text-gray-400">
              No knowledge bases connected.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {currentAssistantKBs.map((kb) => (
                <div
                  key={kb.id}
                  className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-md group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Database className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {kb.knowledgeBases?.[0]?.description ||
                        "Untitled Knowledge Base"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnlink(kb.id)}
                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-gray-400"
                    title="Remove Connection"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedKBToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Knowledge Base Connection"
        message="Are you sure you want to disconnect this knowledge base? This won't delete the data, just the link to this assistant."
      />
    </>
  );
};
