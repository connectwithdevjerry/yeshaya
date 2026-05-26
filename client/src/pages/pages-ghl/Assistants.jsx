// src/pages/pages-ghl/Assistants.jsx
import React, { useState, useEffect } from "react";
import {
  Search, Home, Trash2, Bot, PlusCircle, Star, Download, Archive,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssistants, deleteAssistant } from "../../store/slices/assistantsSlice";
import { motion, AnimatePresence } from "framer-motion";
import TabButton from "../../components/components-ghl/TabButton";
import CreateFolderModal   from "../../components/components-ghl/Assistants/CreateFolderModal";
import CreateAssistantModal from "../../components/components-ghl/Assistants/CreateAssistantModal";
import ConfirmDeleteModal   from "../../components/components-ghl/ConfirmDeleteModal";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useCurrentAccount } from "../../hooks/useCurrentAccount";
import { importSubAccounts } from "../../store/slices/integrationSlice";
import toast from "react-hot-toast";

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[1, 2, 3, 4, 5, 6].map(i => (
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
          <Bot className="w-7 h-7 text-indigo-400" />
        </div>
        <p className="text-gray-500 font-medium">No assistants yet</p>
        <p className="text-gray-400 text-sm">Create your first AI assistant to get started.</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" /> Create Assistant
        </motion.button>
      </div>
    </td>
  </tr>
);

const TABS = [
  { id: "all",       label: "All",      icon: Bot     },
  { id: "favorites", label: "Favorites", icon: Star    },
  { id: "imported",  label: "Imported",  icon: Download },
  { id: "archived",  label: "Archived",  icon: Archive },
];

const Assistants = () => {
  const [isFolderModalOpen,    setIsFolderModalOpen]    = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [activeTab,            setActiveTab]            = useState("all");
  const [deleteModal,          setDeleteModal]          = useState({ isOpen: false, assistant: null });
  const [search,               setSearch]               = useState("");

  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const location       = useLocation();
  const account        = useCurrentAccount();

  const subaccountId = searchParams.get("subaccount") || account?.subaccount;
  const { data: assistants = [], loading } = useSelector(s => s.assistants);

  useEffect(() => {
    if (subaccountId) dispatch(fetchAssistants(subaccountId));
  }, [dispatch, subaccountId]);

  useEffect(() => {
    if (!subaccountId) return;
    dispatch(importSubAccounts([subaccountId]))
      .unwrap()
      .then(res => { if (!res.alreadyInstalled) toast.success("✅ Subaccount imported successfully"); })
      .catch(err => console.log("📥 Background import check:", err));
  }, [dispatch, subaccountId]);

  const openDeleteModal   = (e, a) => { e.stopPropagation(); setDeleteModal({ isOpen: true, assistant: a }); };
  const closeDeleteModal  = ()    => setDeleteModal({ isOpen: false, assistant: null });

  const handleConfirmDelete = async () => {
    if (!deleteModal.assistant) return;
    try {
      await dispatch(deleteAssistant({ subaccountId, assistantId: deleteModal.assistant.id })).unwrap();
      closeDeleteModal();
      toast.success("Assistant deleted");
    } catch (err) { toast.error(err || "Failed to delete assistant"); }
  };

  const handleAssistantClick = (assistant) => {
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

  /* filter by search */
  const filtered = assistants.filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase())
  );
  const counts = { all: assistants.length, favorites: 0, imported: 0, archived: 0 };

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
          {/* Search */}
          <div className="relative flex-grow max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assistants…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>

          {/* Create button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAssistantModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Create Assistant
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
                  <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                    {counts[id] ?? 0}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="assistantsTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-gray-50 text-xs text-gray-400">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  {["Name", "Model", "Updated", "Created", "ID", ""].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <EmptyState onAdd={() => setIsAssistantModalOpen(true)} />
                ) : (
                  filtered.map((assistant, idx) => (
                    <motion.tr
                      key={assistant.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      onClick={() => handleAssistantClick(assistant)}
                      className="hover:bg-indigo-50/30 cursor-pointer group transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-indigo-500" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {assistant.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{assistant.model?.model || "N/A"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(assistant.updatedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{new Date(assistant.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                          {assistant.id.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={e => openDeleteModal(e, assistant)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
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

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} assistant{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
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
