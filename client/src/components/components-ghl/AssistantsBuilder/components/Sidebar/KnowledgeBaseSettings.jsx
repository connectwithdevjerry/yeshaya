// src/components/assistant/KnowledgeBaseSettings.jsx
import React, { useEffect, useState } from "react";
import { ChevronDown, Database, X, Loader2, BookOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmDeleteModal from "../../../ConfirmDeleteModal";
import {
  fetchKnowledgeBases,
  fetchAssistantKnowledgeBases,
  linkKnowledgeBaseToAssistant,
  removeKnowledgeBaseFromAssistant,
} from "../../../../../store/slices/assistantsSlice";
import toast from "react-hot-toast";
import { getSubaccountIdFromUrl } from "../../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

export const KnowledgeBaseSettings = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [showDeleteModal,    setShowDeleteModal]    = useState(false);
  const [selectedKBToDelete, setSelectedKBToDelete] = useState(null);

  const {
    selectedAssistant,
    knowledgeBasesData,
    currentAssistantKBs,
    fetchingKnowledgeBases,
    fetchingAssistantKBs,
    linkingKnowledgeBase,
  } = useSelector((s) => s.assistants);

  const assistantId = selectedAssistant?.id || selectedAssistant?.assistantId;

  useEffect(() => {
    if (knowledgeBasesData.length === 0 && !fetchingKnowledgeBases) dispatch(fetchKnowledgeBases(subaccountId));
    if (assistantId && !fetchingAssistantKBs) dispatch(fetchAssistantKnowledgeBases(assistantId));
  }, [dispatch, assistantId, subaccountId]);

  const availableBases = React.useMemo(
    () => knowledgeBasesData.filter((kb) => !currentAssistantKBs.some((c) => c.id === kb.id)),
    [knowledgeBasesData, currentAssistantKBs]
  );

  const handleConnect = async (toolId) => {
    if (!assistantId || !toolId) return;
    try {
      await dispatch(linkKnowledgeBaseToAssistant({ assistantId, toolId })).unwrap();
      dispatch(fetchAssistantKnowledgeBases(assistantId));
    } catch (err) {
      console.error("Link error:", err);
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
      await dispatch(removeKnowledgeBaseFromAssistant({ assistantId, toolId: selectedKBToDelete })).unwrap();
      dispatch(fetchAssistantKnowledgeBases(assistantId));
    } catch (err) {
      console.error("Unlink error:", err);
    } finally {
      toast.success("Knowledge base disconnected");
      setShowDeleteModal(false);
      setSelectedKBToDelete(null);
    }
  };

  if (!assistantId) {
    return (
      <div className="p-4 text-xs text-gray-400 italic">
        Please select an assistant to configure knowledge.
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-5">
        {/* Section header */}
        <div className="pb-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-700">Knowledge Settings</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Connect knowledge bases to give your assistant access to your data.
          </p>
        </div>

        {/* Connect selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Connect New Source
            </label>
            {linkingKnowledgeBase && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
          </div>
          <div className="relative">
            <select
              onChange={(e) => handleConnect(e.target.value)}
              value=""
              disabled={fetchingKnowledgeBases || linkingKnowledgeBase}
              className="w-full px-3 py-2 pr-8 border border-gray-200 rounded-xl text-sm bg-white outline-none appearance-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {fetchingKnowledgeBases ? "Loading…" : availableBases.length === 0 ? "No sources available" : "Select a knowledge base…"}
              </option>
              {availableBases.map((base) => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Connected list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Connected ({currentAssistantKBs.length})
            </span>
            {fetchingAssistantKBs && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
          </div>

          {currentAssistantKBs.length === 0 && !fetchingAssistantKBs ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/40">
              <BookOpen className="w-6 h-6 text-gray-200" />
              <p className="text-xs text-gray-400">No knowledge bases connected yet.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
              {currentAssistantKBs.map((kb) => (
                <div
                  key={kb.id}
                  className="flex items-center justify-between px-3 py-2 bg-indigo-50/50 border border-indigo-100/60 rounded-xl group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Database className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {kb.knowledgeBases?.[0]?.description || "Untitled Knowledge Base"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleUnlink(kb.id)}
                    className="p-1 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                    title="Remove connection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedKBToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Knowledge Base Connection"
        message="Are you sure you want to disconnect this knowledge base? This won't delete the data, just the link to this assistant."
      />
    </>
  );
};
