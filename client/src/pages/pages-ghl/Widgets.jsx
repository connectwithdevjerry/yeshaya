// src/pages/pages-ghl/Widgets.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search, LayoutGrid, Star, Archive, PlusCircle, Code2, Pencil, Trash2,
  MessageSquare, Loader2, ArchiveRestore,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import CreateWidgetModal from "../../components/components-ghl/Widgets/CreateWidgetModal";
import EmbedCodeModal from "../../components/components-ghl/Widgets/EmbedCodeModal";
import { fetchWidgets, toggleWidgetMeta, deleteWidget } from "../../store/slices/widgetSlice";
import { fetchAssistants } from "../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";

const TABS = [
  { id: "all",       label: "All",       icon: LayoutGrid },
  { id: "favorites", label: "Favorites", icon: Star       },
  { id: "archived",  label: "Archived",  icon: Archive    },
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—");

const Widgets = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const { data: widgets, loading } = useSelector((s) => s.widgets);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [embedWidget, setEmbedWidget] = useState(null);

  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchWidgets(subaccountId));
      dispatch(fetchAssistants(subaccountId));
    }
  }, [dispatch, subaccountId]);

  const filtered = useMemo(() => {
    let list = widgets || [];
    if (activeTab === "favorites") list = list.filter((w) => w.favorite && !w.archived);
    else if (activeTab === "archived") list = list.filter((w) => w.archived);
    else list = list.filter((w) => !w.archived);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((w) => (w.name || "").toLowerCase().includes(q) || (w.assistantName || "").toLowerCase().includes(q));
    return list;
  }, [widgets, activeTab, search]);

  const counts = useMemo(() => ({
    all: (widgets || []).filter((w) => !w.archived).length,
    favorites: (widgets || []).filter((w) => w.favorite && !w.archived).length,
    archived: (widgets || []).filter((w) => w.archived).length,
  }), [widgets]);

  const openCreate = () => { setEditing(null); setCreateOpen(true); };
  const openEdit = (w) => { setEditing(w); setCreateOpen(true); };

  const onToggleFav = (w) => dispatch(toggleWidgetMeta({ id: w._id, favorite: !w.favorite }));
  const onToggleArchive = (w) => {
    dispatch(toggleWidgetMeta({ id: w._id, archived: !w.archived }));
    toast.success(w.archived ? "Restored" : "Archived");
  };
  const onDelete = (w) => {
    if (!window.confirm(`Delete widget “${w.name}”? This cannot be undone.`)) return;
    dispatch(deleteWidget(w._id)).unwrap().then(() => toast.success("Deleted")).catch((e) => toast.error(e || "Failed"));
  };

  const headers = ["Name", "Linked Assistant", "Updated", "Created", ""];

  return (
    <div className="flex-grow bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Widgets</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {counts.all}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search widgets…"
                className="w-52 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition" />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition flex-shrink-0">
              <PlusCircle className="w-4 h-4" /> Create Widget
            </motion.button>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <motion.button key={id} onClick={() => setActiveTab(id)} whileHover={{ y: -1 }} transition={{ duration: 0.12 }}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                    {counts[id]}
                  </span>
                  {isActive && <motion.span layoutId="widgetsTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600" />}
                </motion.button>
              );
            })}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  {headers.map((h, i) => (
                    <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={headers.length} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={headers.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <LayoutGrid className="w-7 h-7 text-indigo-400" />
                      </div>
                      <p className="text-gray-500 font-medium">{activeTab === "all" ? "No widgets yet" : `No ${activeTab} widgets`}</p>
                      <p className="text-gray-400 text-sm">Create a chat widget to embed your assistant on any website.</p>
                      {activeTab === "all" && (
                        <motion.button whileTap={{ scale: 0.97 }} onClick={openCreate}
                          className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition">
                          <PlusCircle className="w-4 h-4" /> Create Widget
                        </motion.button>
                      )}
                    </div>
                  </td></tr>
                ) : (
                  filtered.map((w) => (
                    <tr key={w._id} className="border-t border-gray-50 hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (w.theme?.primaryColor || "#6366f1") + "22" }}>
                            <MessageSquare className="w-4 h-4" style={{ color: w.theme?.primaryColor || "#6366f1" }} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                              {w.name}
                              {w.favorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                            </p>
                            <p className="text-xs text-gray-400">Chat widget</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{w.assistantName || <span className="text-gray-400">—</span>}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{fmtDate(w.updatedAt)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{fmtDate(w.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEmbedWidget(w)} title="Get embed code"
                            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"><Code2 className="w-4 h-4" /></button>
                          <button onClick={() => onToggleFav(w)} title={w.favorite ? "Unfavorite" : "Favorite"}
                            className="p-2 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition">
                            <Star className={`w-4 h-4 ${w.favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                          </button>
                          <button onClick={() => openEdit(w)} title="Edit"
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => onToggleArchive(w)} title={w.archived ? "Restore" : "Archive"}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
                            {w.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          </button>
                          <button onClick={() => onDelete(w)} title="Delete"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <CreateWidgetModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        subaccountId={subaccountId}
        editing={editing}
      />
      <EmbedCodeModal
        isOpen={!!embedWidget}
        onClose={() => setEmbedWidget(null)}
        widget={embedWidget}
      />
    </div>
  );
};

export default Widgets;
