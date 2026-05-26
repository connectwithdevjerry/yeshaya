// src/pages/pages-ghl/Tags.jsx
import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Home, Tag as TagIcon, MoreHorizontal, Trash2, MoveRight, PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import CreateActiveTagModal from "../../components/components-ghl/ActiveTag/ActiveTag";

const activeTags = [
  {
    id: 1,
    name: "New Tag zO0xy0",
    updated: "Oct 28, 2025 1:43 pm",
    tagValue: "1761655360642×166378648116133900",
    assistant: "Obaloluwa",
  },
  {
    id: 2,
    name: "New Tag k6PwBP",
    updated: "Oct 28, 2025 4:44 pm",
    tagValue: "1761663053864×888663562962600000",
    assistant: "Jerry",
  },
];

const TagsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            <h1 className="text-xl font-bold text-gray-900">Active Tags</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {activeTags.length}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Create Active Tag
          </motion.button>
        </motion.div>

        {/* ── Card with table ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Breadcrumb */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </div>
            <span>{activeTags.length} result{activeTags.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[25%]">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[20%]">Updated</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[30%]">Tag</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-[15%]">Linked Assistant</th>
                  <th className="px-5 py-3 w-[10%]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTags.map((tag, idx) => (
                  <motion.tr
                    key={tag.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.05 }}
                    className="hover:bg-indigo-50/30 transition-colors duration-150 group"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <TagIcon className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">{tag.name}</span>
                      </div>
                    </td>

                    {/* Updated */}
                    <td className="px-5 py-4 text-sm text-gray-500 truncate">{tag.updated}</td>

                    {/* Tag ID */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md truncate block">
                        {tag.tagValue}
                      </span>
                    </td>

                    {/* Linked Assistant */}
                    <td className="px-5 py-4">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap"
                      >
                        {tag.assistant}
                        <MoveRight className="w-3 h-3 text-gray-400" />
                      </motion.button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <select className="pl-2 pr-6 py-1 border border-gray-200 rounded-lg text-xs outline-none">
                <option>10</option>
              </select>
              <span>Showing 1–{activeTags.length} · <span className="font-medium text-gray-600">{activeTags.length} Results</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span>Page 1 of 1</span>
              <button className="p-1 border border-gray-200 rounded-lg disabled:opacity-40" disabled><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className="p-1 border border-gray-200 rounded-lg disabled:opacity-40" disabled><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </motion.div>
      </div>

      <CreateActiveTagModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TagsPage;
