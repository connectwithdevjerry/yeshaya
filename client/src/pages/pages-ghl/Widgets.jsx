// src/pages/pages-ghl/Widgets.jsx
import React, { useState } from "react";
import {
  Search, ChevronLeft, ChevronRight, Home, LayoutGrid, Star, Archive, PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import CreateWidgetModal from "../../components/components-ghl/Widgets/CreateWidgetModal";

const widgets = [];

const TABS = [
  { id: "all",       label: "All",       icon: LayoutGrid },
  { id: "favorites", label: "Favorites", icon: Star       },
  { id: "archived",  label: "Archived",  icon: Archive    },
];

const Widgets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab,   setActiveTab]   = useState("all");
  const [search,      setSearch]      = useState("");

  const headers = ["Name", "Updated", "Created", "Type", "Linked Assistant"];

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
            <h1 className="text-xl font-bold text-gray-900">Widgets</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {widgets.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search widgets…"
                className="w-52 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Create Widget
            </motion.button>
          </div>
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
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                    0
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="widgetsTabUnderline"
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
            <span>0 results</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  {headers.map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={headers.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <LayoutGrid className="w-7 h-7 text-indigo-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No widgets yet</p>
                      <p className="text-gray-400 text-sm">Create your first widget to embed AI on your site.</p>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsModalOpen(true)}
                        className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
                      >
                        <PlusCircle className="w-4 h-4" /> Create Widget
                      </motion.button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <select className="pl-2 pr-6 py-1 border border-gray-200 rounded-lg text-xs outline-none">
                <option>10</option>
              </select>
              <span>Showing 0 results</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Page 1 of 1</span>
              <button className="p-1 border border-gray-200 rounded-lg disabled:opacity-40" disabled><ChevronLeft className="w-3.5 h-3.5" /></button>
              <button className="p-1 border border-gray-200 rounded-lg disabled:opacity-40" disabled><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </motion.div>
      </div>

      <CreateWidgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Widgets;
