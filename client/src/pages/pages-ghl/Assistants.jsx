// src/pages/pages-ghl/Assistants.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search, Trash2, Bot, PlusCircle, Star, Download, Archive,
  Loader2, LayoutGrid, List, Cpu, Calendar, Clock,
  ChevronRight, Sparkles, X,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssistants, deleteAssistant } from "../../store/slices/assistantsSlice";
import { motion, AnimatePresence } from "framer-motion";
import CreateFolderModal    from "../../components/components-ghl/Assistants/CreateFolderModal";
import CreateAssistantModal from "../../components/components-ghl/Assistants/CreateAssistantModal";
import ConfirmDeleteModal   from "../../components/components-ghl/ConfirmDeleteModal";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { importSubAccounts } from "../../store/slices/integrationSlice";
import toast from "react-hot-toast";

/* ── gradient per model provider ── */
const MODEL_GRADIENT = {
  "gpt-4o":           "from-emerald-500 to-teal-500",
  "gpt-4":            "from-blue-500 to-cyan-500",
  "gpt-3.5-turbo":    "from-sky-400 to-blue-500",
  "claude-3-opus":    "from-orange-500 to-amber-500",
  "claude-3-sonnet":  "from-orange-400 to-yellow-400",
  "claude-3-haiku":   "from-yellow-400 to-amber-400",
};
const getGrad = (model) =>
  MODEL_GRADIENT[model?.model] || "from-indigo-500 to-violet-600";

const TABS = [
  { id: "all",       label: "All",       icon: Bot      },
  { id: "favorites", label: "Favorites", icon: Star     },
  { id: "imported",  label: "Imported",  icon: Download },
  { id: "archived",  label: "Archived",  icon: Archive  },
];

/* ── skeleton card ── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-4">
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-8 bg-gray-100 rounded-xl" />
      <div className="h-8 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

/* ── empty state ── */
const EmptyState = ({ filtered, onAdd, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="col-span-full flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="relative mb-5">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
        <Bot className="w-10 h-10 text-indigo-400" />
      </div>
      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
        <Sparkles className="w-3 h-3 text-white" />
      </div>
    </div>
    <p className="text-base font-semibold text-gray-800">
      {filtered ? "No results found" : "No assistants yet"}
    </p>
    <p className="text-sm text-gray-400 mt-1 mb-6 max-w-xs">
      {filtered ? "Try a different search term." : "Create your first AI voice assistant to start handling calls."}
    </p>
    {filtered
      ? <button onClick={onClear} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <X className="w-3.5 h-3.5" /> Clear search
        </button>
      : <button onClick={onAdd} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all">
          <PlusCircle className="w-4 h-4" /> Create Assistant
        </button>
    }
  </motion.div>
);

/* ── assistant card ── */
const AssistantCard = ({ assistant, onOpen, onDelete, idx }) => {
  const grad = getGrad(assistant.model);
  const initials = (assistant.name || "A").slice(0, 2).toUpperCase();
  const model    = assistant.model?.model || "N/A";
  const updated  = new Date(assistant.updatedAt).toLocaleDateString();
  const created  = new Date(assistant.createdAt).toLocaleDateString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, delay: idx * 0.04 }}
      whileHover={{ y: -3 }}
      onClick={onOpen}
      className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:shadow-gray-100/80 transition-all group relative overflow-hidden"
    >
      {/* bg glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100/30 to-violet-100/30 blur-2xl pointer-events-none" />

      {/* Top row */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-md shadow-black/10`}>
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {assistant.name}
          </p>
          <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-gradient-to-r ${grad} text-white`}>
            <Cpu className="w-2.5 h-2.5" /> {model}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e, assistant); }}
          className="p-1.5 rounded-lg text-gray-200 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
          <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-gray-300 text-[9px] uppercase tracking-wide">Created</p>
            <p className="text-gray-600 font-medium">{created}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
          <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-gray-300 text-[9px] uppercase tracking-wide">Updated</p>
            <p className="text-gray-600 font-medium">{updated}</p>
          </div>
        </div>
      </div>

      {/* Open button */}
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[10px] text-gray-300 truncate">
          {assistant.id?.slice(0, 10)}…
        </span>
        <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Open <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </motion.div>
  );
};

/* ── table row ── */
const AssistantRow = ({ assistant, onOpen, onDelete, idx }) => {
  const grad = getGrad(assistant.model);
  const initials = (assistant.name || "A").slice(0, 2).toUpperCase();

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, delay: idx * 0.025 }}
      onClick={onOpen}
      className="hover:bg-indigo-50/30 cursor-pointer group transition-colors border-b border-gray-50 last:border-b-0"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {assistant.name}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-gradient-to-r ${grad} text-white`}>
          <Cpu className="w-2.5 h-2.5" /> {assistant.model?.model || "N/A"}
        </span>
      </td>
      <td className="px-5 py-3.5 text-sm text-gray-400">{new Date(assistant.updatedAt).toLocaleDateString()}</td>
      <td className="px-5 py-3.5 text-sm text-gray-400">{new Date(assistant.createdAt).toLocaleDateString()}</td>
      <td className="px-5 py-3.5">
        <span className="font-mono text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">
          {assistant.id?.slice(0, 8)}…
        </span>
      </td>
      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => onDelete(e, assistant)}
          className="p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </motion.tr>
  );
};

/* ── main component ── */
const Assistants = () => {
  const [isFolderModalOpen,    setIsFolderModalOpen]    = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [activeTab,            setActiveTab]            = useState("all");
  const [deleteModal,          setDeleteModal]          = useState({ isOpen: false, assistant: null });
  const [search,               setSearch]               = useState("");
  const [viewMode,             setViewMode]             = useState("grid");

  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const location       = useLocation();
  const account        = useCurrentAccount();

  const subaccountId = searchParams.get("subaccount") || account?.subaccount;
  const { data: assistants = [], loading } = useSelector((s) => s.assistants);

  useEffect(() => {
    if (subaccountId) dispatch(fetchAssistants(subaccountId));
  }, [dispatch, subaccountId]);

  useEffect(() => {
    if (!subaccountId) return;
    dispatch(importSubAccounts([subaccountId]))
      .unwrap()
      .then((res) => { if (!res.alreadyInstalled) toast.success("Subaccount imported"); })
      .catch((err) => console.log("Background import check:", err));
  }, [dispatch, subaccountId]);

  const openDeleteModal  = (e, a) => { e.stopPropagation(); setDeleteModal({ isOpen: true, assistant: a }); };
  const closeDeleteModal = ()    => setDeleteModal({ isOpen: false, assistant: null });

  const handleConfirmDelete = async () => {
    if (!deleteModal.assistant) return;
    try {
      await dispatch(deleteAssistant({ subaccountId, assistantId: deleteModal.assistant.id })).unwrap();
      closeDeleteModal();
      toast.success("Assistant deleted");
    } catch (err) { toast.error(err || "Failed to delete"); }
  };

  const handleOpen = (assistant) => {
    if (location.pathname === "/app" && account) {
      const p = new URLSearchParams({
        agencyid: account.agencyid, subaccount: account.subaccount,
        allow: account.allow, myname: account.myname,
        myemail: account.myemail, route: `/assistants/${assistant.id}`,
      });
      navigate(`/app?${p.toString()}`);
    } else {
      navigate(`/assistants/${assistant.id}`);
    }
  };

  const filtered = useMemo(() =>
    assistants.filter((a) => !search || a.name?.toLowerCase().includes(search.toLowerCase())),
    [assistants, search]
  );

  const counts = { all: assistants.length, favorites: 0, imported: 0, archived: 0 };

  /* stats */
  const uniqueModels  = [...new Set(assistants.map((a) => a.model?.model).filter(Boolean))].length;
  const weekAgo       = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newThisWeek   = assistants.filter((a) => new Date(a.createdAt) > weekAgo).length;

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
            <h1 className="text-xl font-bold text-gray-900">Assistants</h1>
            <p className="text-xs text-gray-400 mt-0.5">Build and manage your AI voice assistants</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assistants…"
                className="w-48 pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-0.5 gap-0.5">
              {[{ mode: "grid", Icon: LayoutGrid }, { mode: "list", Icon: List }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-colors ${viewMode === mode ? "bg-indigo-50 text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Create */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsAssistantModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Create Assistant
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",          value: assistants.length, gradient: "from-indigo-500 to-violet-600",  Icon: Bot      },
            { label: "Models Used",    value: uniqueModels,      gradient: "from-sky-500    to-blue-600",    Icon: Cpu      },
            { label: "New This Week",  value: newThisWeek,       gradient: "from-emerald-500 to-teal-500",   Icon: Sparkles },
            { label: "Filtered View",  value: filtered.length,   gradient: "from-orange-500 to-amber-500",   Icon: Search   },
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
                  {loading ? <span className="inline-block w-6 h-5 bg-gray-100 rounded animate-pulse" /> : value}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Tab strip + content ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => {
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
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold
                    ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"}`}>
                    {counts[id] ?? 0}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="assistantsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="p-4">
            {/* Grid view */}
            {viewMode === "grid" && (
              <AnimatePresence>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState filtered={!!search} onAdd={() => setIsAssistantModalOpen(true)} onClear={() => setSearch("")} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((a, idx) => (
                      <AssistantCard
                        key={a.id}
                        assistant={a}
                        idx={idx}
                        onOpen={() => handleOpen(a)}
                        onDelete={openDeleteModal}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            )}

            {/* List view */}
            {viewMode === "list" && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100">
                      {["Name", "Model", "Updated", "Created", "ID", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse border-b border-gray-50">
                          {[180, 120, 80, 80, 80, 40].map((w, j) => (
                            <td key={j} className="px-5 py-4">
                              <div className="h-3.5 bg-gray-100 rounded-full" style={{ width: w }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={6}><EmptyState filtered={!!search} onAdd={() => setIsAssistantModalOpen(true)} onClear={() => setSearch("")} /></td></tr>
                    ) : (
                      <AnimatePresence>
                        {filtered.map((a, idx) => (
                          <AssistantRow
                            key={a.id}
                            assistant={a}
                            idx={idx}
                            onOpen={() => handleOpen(a)}
                            onDelete={openDeleteModal}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              {filtered.length} assistant{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.assistant?.name}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
      <CreateFolderModal    isOpen={isFolderModalOpen}    onClose={() => setIsFolderModalOpen(false)} />
      <CreateAssistantModal isOpen={isAssistantModalOpen} onClose={() => setIsAssistantModalOpen(false)} />
    </div>
  );
};

export default Assistants;
