// src/pages/pages-ghl/Knowledge.jsx
import React, { useState, useEffect } from "react";
import {
  Trash2, BookOpen, PlusCircle, ExternalLink,
  Mic, FileText, Globe, MessageSquare, Database,
  Loader2, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchKnowledgeBases, deleteKnowledgeBase, getFileDetails } from "../../store/slices/assistantsSlice";
import { toast } from "react-hot-toast";
import ConfirmDeleteModal from "../../components/components-ghl/ConfirmDeleteModal";
import UploadModal from "../../components/components-ghl/Knowledge/UploadModal";
import EmbeddingPlaygroundModal from "../../components/components-ghl/Knowledge/EmbeddingPlaygroundModal";
import { FlaskConical } from "lucide-react";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

/* ── type icon map ── */
const TYPE_META = {
  text: { icon: FileText,     bg: "bg-indigo-50",  text: "text-indigo-500",  label: "Text"  },
  faq:  { icon: MessageSquare,bg: "bg-emerald-50", text: "text-emerald-500", label: "FAQ"   },
  file: { icon: FileText,     bg: "bg-violet-50",  text: "text-violet-500",  label: "File"  },
  url:  { icon: Globe,        bg: "bg-orange-50",  text: "text-orange-500",  label: "URL"   },
};
const getTypeMeta = (base) => {
  if (base.type) return TYPE_META[base.type] || TYPE_META.text;
  if (base.isVoiceEnabled) return TYPE_META.text;
  return TYPE_META.text;
};

const fmtBytes = (n) => {
  if (!n) return null;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const TABS = [
  { id: "all",   label: "All"   },
  { id: "voice", label: "Voice" },
  { id: "empty", label: "Empty" },
];

/* ── skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  </div>
);

/* ── empty state ── */
const EmptyState = ({ onAdd }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center col-span-full"
  >
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mb-4">
      <BookOpen className="w-8 h-8 text-indigo-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700">No knowledge bases yet</p>
    <p className="text-xs text-gray-400 mt-1 mb-5">Upload your first document, URL or FAQ.</p>
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
    >
      <PlusCircle className="w-4 h-4" /> New Knowledge Base
    </button>
  </motion.div>
);

/* ── knowledge base card ── */
const KBCard = ({ base, onView, onTest, onDelete, isDetailsLoading, idx }) => {
  const meta    = getTypeMeta(base);
  const Icon    = meta.icon;
  const m        = base.meta || null;
  const sizeStr  = fmtBytes(m?.sizeBytes);
  const charsStr = m?.extractedChars ? `${m.extractedChars.toLocaleString()} chars` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, delay: idx * 0.05 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:shadow-gray-100/80 transition-all group relative overflow-hidden"
    >
      {/* subtle gradient glow top-right */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100/40 to-violet-100/40 blur-xl pointer-events-none" />

      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
          <Icon className={`w-4.5 h-4.5 ${meta.text}`} size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {base.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${meta.bg} ${meta.text}`}>
              {meta.label}
            </span>
            {base.isVoiceEnabled && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600">
                <Mic className="w-2.5 h-2.5" /> Voice
              </span>
            )}
          </div>
        </div>
        {/* delete — shows on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(base); }}
          className="p-1.5 rounded-lg text-gray-200 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400 border-t border-gray-50 pt-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-300 font-semibold">Created</p>
          <p className="mt-0.5 font-medium text-gray-500">{base.created || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-gray-300 font-semibold">Updated</p>
          <p className="mt-0.5 font-medium text-gray-500">{base.updated || "—"}</p>
        </div>
      </div>

      {/* File metadata (Phase A/B) */}
      {(m?.originalName || sizeStr || charsStr || (m?.version > 1)) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3 -mt-1">
          {m?.originalName && (
            <span className="text-[10px] text-gray-500 truncate max-w-full" title={m.originalName}>{m.originalName}</span>
          )}
          {sizeStr && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-500">{sizeStr}</span>}
          {charsStr && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-gray-50 text-gray-500">{charsStr}</span>}
          {m?.version > 1 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600">v{m.version}</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(base)}
          disabled={isDetailsLoading}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-100 text-xs font-medium text-gray-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50 disabled:opacity-40 transition-all"
        >
          {isDetailsLoading
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <ExternalLink className="w-3 h-3" />
          }
          {isDetailsLoading ? "Loading…" : "View"}
        </button>
        <button
          onClick={() => onTest(base)}
          title="Test this knowledge base"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-indigo-100 bg-indigo-50/60 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-all"
        >
          <FlaskConical className="w-3 h-3" /> Test
        </button>
      </div>
    </motion.div>
  );
};

/* ── page ── */
const KnowledgePage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [activeTab,        setActiveTab]        = useState("all");
  const [deleteModal,      setDeleteModal]      = useState({ isOpen: false, base: null });
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [textPreview,      setTextPreview]      = useState(null); // { title, content }
  const [playground,       setPlayground]       = useState(null); // { toolId, name }

  const { knowledgeBasesData = [], fetchingKnowledgeBases } = useSelector((s) => s.assistants);

  useEffect(() => { dispatch(fetchKnowledgeBases(subaccountId)); }, [dispatch, subaccountId]);

  const handleViewContent = async (base) => {
    const m = base.meta;

    // Phase B preview: inline text for text/faq/url, Cloudinary original for files
    if (m) {
      if (["text", "faq", "url"].includes(m.type) && m.sourceText) {
        setTextPreview({ title: base.name, content: m.sourceText, sourceUrl: m.sourceUrl });
        return;
      }
      if (m.type === "file" && m.cloudinaryUrl) {
        window.open(m.cloudinaryUrl, "_blank", "noopener,noreferrer");
        return;
      }
    }

    // Fallback: legacy KBs (pre-feature) → Vapi file URL
    const fileId = base.fileIds?.[0];
    if (!fileId) { toast.error("No content available to preview"); return; }
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

  const openDeleteModal    = (base) => setDeleteModal({ isOpen: true, base });
  const closeDeleteModal   = () => setDeleteModal({ isOpen: false, base: null });

  const handleConfirmDelete = async () => {
    if (!deleteModal.base) return;
    try {
      await dispatch(deleteKnowledgeBase({ toolId: deleteModal.base.id })).unwrap();
      closeDeleteModal();
      toast.success("Knowledge base deleted");
    } catch (err) { console.error(err); }
  };

  const filtered = knowledgeBasesData.filter((b) => {
    if (activeTab === "voice") return b.isVoiceEnabled;
    if (activeTab === "empty") return b.sourcesCount === 0;
    return true;
  });

  const counts = {
    all:   knowledgeBasesData.length,
    voice: knowledgeBasesData.filter((b) => b.isVoiceEnabled).length,
    empty: knowledgeBasesData.filter((b) => b.sourcesCount === 0).length,
  };

  const voiceCount = knowledgeBasesData.filter((b) => b.isVoiceEnabled).length;

  return (
    <div className="flex-grow bg-gray-50/60 min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-xl font-bold text-gray-900">Knowledge Bases</h1>
            <p className="text-xs text-gray-400 mt-0.5">Train your AI with documents, FAQs, and web content</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> New Knowledge Base
          </motion.button>
        </motion.div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Bases",    value: knowledgeBasesData.length, gradient: "from-indigo-500 to-violet-600",  Icon: Database   },
            { label: "Voice Enabled",  value: voiceCount,                gradient: "from-violet-500 to-purple-600", Icon: Mic        },
            { label: "Empty Bases",    value: counts.empty,              gradient: "from-rose-500 to-pink-600",     Icon: BookOpen   },
            { label: "Active Sources", value: knowledgeBasesData.reduce((a, b) => a + (b.sourcesCount || 0), 0), gradient: "from-emerald-500 to-teal-500", Icon: Sparkles },
          ].map(({ label, value, gradient, Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 + i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-none tabular-nums">
                  {fetchingKnowledgeBases
                    ? <span className="inline-block w-8 h-5 bg-gray-100 rounded animate-pulse" />
                    : value}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Tab strip + grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          {/* Tabs */}
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
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold
                    ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                    {counts[id] ?? 0}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="knowledgeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4">
            {fetchingKnowledgeBases ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onAdd={() => setIsModalOpen(true)} />
            ) : (
              <AnimatePresence>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filtered.map((base, idx) => (
                    <KBCard
                      key={base.id}
                      base={base}
                      idx={idx}
                      onView={handleViewContent}
                      onTest={(b) => setPlayground({ toolId: b.id, name: b.name })}
                      onDelete={openDeleteModal}
                      isDetailsLoading={isDetailsLoading}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          {!fetchingKnowledgeBases && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {filtered.length} knowledge base{filtered.length !== 1 ? "s" : ""} in this view
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
        onClose={() => { setIsModalOpen(false); dispatch(fetchKnowledgeBases(subaccountId)); }}
      />

      <EmbeddingPlaygroundModal
        isOpen={!!playground}
        toolId={playground?.toolId}
        knowledgeBaseName={playground?.name}
        onClose={() => setPlayground(null)}
      />

      {/* ── Inline text/FAQ/URL preview ── */}
      <AnimatePresence>
        {textPreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setTextPreview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{textPreview.title}</h3>
                </div>
                <button onClick={() => setTextPreview(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0 text-lg leading-none">×</button>
              </div>
              {textPreview.sourceUrl && (
                <a href={textPreview.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="px-5 py-2 text-xs text-indigo-600 hover:underline flex items-center gap-1 border-b border-gray-50">
                  <Globe className="w-3 h-3" /> {textPreview.sourceUrl}
                </a>
              )}
              <pre className="flex-1 overflow-y-auto px-5 py-4 text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                {textPreview.content}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgePage;
