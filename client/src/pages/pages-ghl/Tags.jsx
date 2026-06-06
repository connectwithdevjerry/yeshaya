// src/pages/pages-ghl/Tags.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Home, Tag as TagIcon, Trash2, PlusCircle, Loader2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import CreateActiveTagModal from "../../components/components-ghl/ActiveTag/ActiveTag";
import apiClient from "../../store/api/config";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";

const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

const TagsPage = () => {
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const [tags, setTags]           = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(() => {
    if (!subaccountId) { setLoading(false); return; }
    setLoading(true);
    apiClient.get(`/active-tags?subaccountId=${subaccountId}`)
      .then((res) => { if (res.data.status) setTags(res.data.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subaccountId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!subaccountId) return;
    apiClient.get(`/assistants/get-all?subaccountId=${subaccountId}`)
      .then((res) => { if (res.data.status) setAssistants(res.data.data || []); })
      .catch(() => {});
  }, [subaccountId]);

  const handleDelete = async (id) => {
    try {
      const res = await apiClient.delete(`/active-tags/${id}`);
      if (res.data.status) { setTags((p) => p.filter((t) => t._id !== id)); toast.success("Tag deleted"); }
      else toast.error(res.data.message || "Failed to delete");
    } catch (e) { toast.error(e.response?.data?.message || "Failed to delete"); }
  };

  return (
    <div className="flex-grow bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Active Tags</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">{tags.length}</span>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setIsModalOpen(true)} disabled={!subaccountId}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50">
            <PlusCircle className="w-4 h-4" /> Create Active Tag
          </motion.button>
        </motion.div>

        {/* Intro note */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl px-4 py-3 text-xs text-indigo-700 leading-relaxed">
          Active Tags are GoHighLevel tags your assistants apply to contacts during calls (via the <span className="font-mono">Add Tag</span> tool) to segment leads and trigger your GHL workflows.
        </div>

        {/* Table card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /><span>Home</span></div>
            <span>{tags.length} result{tags.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
          ) : tags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3"><TagIcon className="w-5 h-5 text-indigo-300" /></div>
              <p className="text-sm font-medium text-gray-500">No active tags yet</p>
              <p className="text-xs text-gray-400 mt-1">Create one to segment contacts during calls.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[24%]">Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[18%]">Created</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[30%]">When to apply</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[18%]">Assistant</th>
                    <th className="px-5 py-3 w-[10%]" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {tags.map((tag, idx) => (
                      <motion.tr key={tag._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0"><TagIcon className="w-3.5 h-3.5 text-indigo-500" /></div>
                            <span className="text-sm font-semibold text-gray-900 truncate">{tag.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 truncate">{fmtDate(tag.createdAt)}</td>
                        <td className="px-5 py-4 text-xs text-gray-500 truncate" title={tag.instruction}>{tag.instruction || <span className="text-gray-300">—</span>}</td>
                        <td className="px-5 py-4">
                          {tag.assistantName
                            ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 rounded-lg text-xs font-medium text-gray-600"><Bot className="w-3 h-3 text-gray-400" /> {tag.assistantName}</span>
                            : <span className="text-xs text-gray-300">Any</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(tag._id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <CreateActiveTagModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subaccountId={subaccountId}
        assistants={assistants}
        onCreated={load}
      />
    </div>
  );
};

export default TagsPage;
