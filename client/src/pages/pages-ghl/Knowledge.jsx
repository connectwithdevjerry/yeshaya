// src/pages/pages-ghl/Knowledge.jsx
import React, { useState, useEffect } from "react";
import { Home, Trash2, MessageCircle, BookOpen, PlusCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import TabButton from "../../components/components-ghl/TabButton";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchKnowledgeBases, deleteKnowledgeBase, getFileDetails,
} from "../../store/slices/assistantsSlice";
import { toast } from "react-hot-toast";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";
import UploadModal from "../../components/components-ghl/Knowledge/UploadModal";

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5].map(i => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
      </td>
    ))}
  </tr>
);

/* ── Empty state ── */
const EmptyState = ({ onAdd }) => (
  <tr>
    <td colSpan={6} className="px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-gray-500 font-medium">No knowledge bases yet</p>
        <p className="text-gray-400 text-sm">Upload your first document or source.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" /> New Knowledge Base
        </motion.button>
      </div>
    </td>
  </tr>
);

const TABS = [
  { id: "all",   label: "All"   },
  { id: "voice", label: "Voice" },
  { id: "empty", label: "Empty" },
];

const KnowledgePage = () => {
  const dispatch = useDispatch();
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [activeTab,        setActiveTab]        = useState("all");
  const [deleteModal,      setDeleteModal]      = useState({ isOpen: false, base: null });
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { knowledgeBasesData = [], fetchingKnowledgeBases } = useSelector(s => s.assistants);

  useEffect(() => { dispatch(fetchKnowledgeBases()); }, [dispatch]);

  const handleViewContent = async (base) => {
    const fileId = base.fileIds?.[0];
    if (!fileId) { toast.error("No file associated with this knowledge base"); return; }
    setIsDetailsLoading(true);
    try {
      const result = await dispatch(getFileDetails({ fileId })).unwrap();
      if (result?.url) {
        toast.success(`Opening ${result.name || "file"}…`);
        window.open(result.url, "_blank", "noopener,noreferrer");
      } else { toast.error("File URL not found"); }
    } catch (err) { toast.error(err || "Failed to load file"); }
    finally { setIsDetailsLoading(false); }
  };

  const openDeleteModal    = (e, base) => { e.stopPropagation(); setDeleteModal({ isOpen: true, base }); };
  const closeDeleteModal   = () => setDeleteModal({ isOpen: false, base: null });

  const handleConfirmDelete = async () => {
    if (!deleteModal.base) return;
    try {
      await dispatch(deleteKnowledgeBase({ toolId: deleteModal.base.id })).unwrap();
      closeDeleteModal();
      toast.success("Knowledge base deleted");
    } catch (err) { console.error(err); }
  };

  const filteredBases = knowledgeBasesData.filter(base => {
    if (activeTab === "voice") return base.isVoiceEnabled;
    if (activeTab === "empty") return base.sourcesCount === 0;
    return true;
  });

  const counts = {
    all:   knowledgeBasesData.length,
    voice: knowledgeBasesData.filter(b => b.isVoiceEnabled).length,
    empty: knowledgeBasesData.filter(b => b.sourcesCount === 0).length,
  };

  return (
    <div className="flex-grow bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Top bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Knowledge Bases</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {knowledgeBasesData.length}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> New Knowledge Base
          </motion.button>
        </motion.div>

        {/* ── Card with tabs + table ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
            {TABS.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.12 }}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150
                    ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
                >
                  {label}
                  <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                    {counts[id] ?? 0}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="knowledgeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </div>
            <span>{filteredBases.length} result{filteredBases.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3 w-10" />
                  {["Name", "Updated", "Created", "Content"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                  <th className="px-5 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchingKnowledgeBases ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredBases.length === 0 ? (
                  <EmptyState onAdd={() => setIsModalOpen(true)} />
                ) : (
                  filteredBases.map((base, idx) => (
                    <motion.tr
                      key={base.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18, delay: idx * 0.04 }}
                      className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                    >
                      <td className="pl-5 py-3.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4 text-indigo-500" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {base.name}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{base.updated || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{base.created || "—"}</td>
                      <td className="px-5 py-3.5">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleViewContent(base)}
                          disabled={isDetailsLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {isDetailsLoading ? "Loading…" : "View"}
                        </motion.button>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={e => openDeleteModal(e, base)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!fetchingKnowledgeBases && filteredBases.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filteredBases.length} knowledge base{filteredBases.length !== 1 ? "s" : ""}
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.base?.name}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); dispatch(fetchKnowledgeBases()); }}
      />
    </div>
  );
};

export default KnowledgePage;
