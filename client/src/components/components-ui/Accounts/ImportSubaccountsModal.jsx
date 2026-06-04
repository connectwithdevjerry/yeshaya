// src/components/components-ui/Accounts/ImportSubaccountsModal.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, ChevronLeft, ChevronRight, Building2,
  CheckCircle2, Loader2, UploadCloud, AlertCircle, Check,
} from "lucide-react";
import { importSubAccounts, fetchImportedSubAccounts } from "../../../store/slices/integrationSlice";
import apiClient from "../../../store/api/config";
import toast from "react-hot-toast";

const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-blue-500 to-cyan-600",
];
const gradFor = (s = "") => GRADIENTS[(s.charCodeAt(0) || 0) % GRADIENTS.length];

const ImportSubaccountsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [locations,   setLocations]   = useState([]);
  const [installedIds, setInstalledIds] = useState(new Set());
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const [importing,   setImporting]   = useState(false);
  const perPage = 6;

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());
    setSearch("");
    setPage(1);

    // Fetch ALL locations + the already-imported ones in parallel
    Promise.all([
      apiClient.get("/integrations/get-subaccounts?userType=anon"),
      apiClient.get("/integrations/get-subaccounts").catch(() => ({ data: { data: [] } })),
    ])
      .then(([allRes, importedRes]) => {
        const all = allRes.data?.data?.locations || [];
        const imported = importedRes.data?.data || [];
        setLocations(all);
        setInstalledIds(new Set(imported.map((a) => a.id)));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load sub-accounts");
        setLoading(false);
      });
  }, [isOpen]);

  // Filter by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return locations.filter((l) =>
      !q ||
      (l.name || l.business?.name || "").toLowerCase().includes(q) ||
      l.id?.toLowerCase().includes(q)
    );
  }, [locations, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  const availableCount = filtered.filter((l) => !installedIds.has(l.id)).length;
  const importedCount  = locations.filter((l) => installedIds.has(l.id)).length;

  if (!isOpen) return null;

  const toggle = (id) => {
    if (installedIds.has(id)) return; // can't select installed
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    const selectable = paged.filter((l) => !installedIds.has(l.id)).map((l) => l.id);
    const allSelected = selectable.length > 0 && selectable.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) selectable.forEach((id) => next.delete(id));
      else selectable.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleImport = async () => {
    const ids = [...selectedIds];
    if (!ids.length) { toast.error("Select at least one sub-account"); return; }
    setImporting(true);
    try {
      const response = await dispatch(importSubAccounts(ids)).unwrap();
      if (response.alreadyInstalled) {
        toast.success("Those sub-accounts are already installed");
      } else {
        toast.success(`${ids.length} sub-account${ids.length !== 1 ? "s" : ""} imported`);
      }
      dispatch(fetchImportedSubAccounts());
      onClose();
    } catch (err) {
      toast.error(`Import failed: ${err.message || err}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={!importing ? onClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <UploadCloud className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Import Sub-accounts</h3>
                <p className="text-xs text-gray-400 mt-0.5">Select GoHighLevel locations to add</p>
              </div>
            </div>
            <button onClick={onClose} disabled={importing}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-50 bg-gray-50/40">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search locations…"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs flex-shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-semibold">{availableCount} available</span>
              {importedCount > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-semibold">{importedCount} imported</span>
              )}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                <p className="text-sm text-gray-400">Loading sub-accounts…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <AlertCircle className="w-7 h-7 text-rose-400" />
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center"><Building2 className="w-5 h-5 text-gray-300" /></div>
                <p className="text-sm text-gray-500">No locations found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* select-all row */}
                <button onClick={toggleAllOnPage}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-1">
                  <Check className="w-3.5 h-3.5" /> Select all available on this page
                </button>

                {paged.map((loc) => {
                  const isInstalled = installedIds.has(loc.id);
                  const isSelected  = selectedIds.has(loc.id);
                  const name = loc.name || loc.business?.name || "Unnamed Location";
                  return (
                    <div
                      key={loc.id}
                      onClick={() => toggle(loc.id)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${
                        isInstalled
                          ? "border-gray-100 bg-gray-50/60 opacity-70 cursor-not-allowed"
                          : isSelected
                          ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-500/10 cursor-pointer"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 cursor-pointer"
                      }`}
                    >
                      {/* checkbox */}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isInstalled ? "border-gray-200 bg-gray-100"
                        : isSelected ? "border-indigo-500 bg-indigo-500"
                        : "border-gray-300 bg-white"
                      }`}>
                        {isSelected && !isInstalled && <Check className="w-3 h-3 text-white" />}
                        {isInstalled && <Check className="w-3 h-3 text-gray-400" />}
                      </div>

                      {/* avatar */}
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradFor(name)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {name.charAt(0).toUpperCase()}
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                        <p className="text-[11px] text-gray-400 font-mono truncate">{loc.id}</p>
                      </div>

                      {/* status */}
                      {isInstalled && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Imported
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Pagination ── */}
          {!loading && !error && filtered.length > perPage && (
            <div className="flex items-center justify-between px-6 py-2.5 border-t border-gray-50">
              <span className="text-xs text-gray-400">Page {safePage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/40">
            <span className="text-xs text-gray-500">
              {selectedIds.size > 0
                ? <><span className="font-semibold text-indigo-600">{selectedIds.size}</span> selected</>
                : "Select sub-accounts to import"}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={onClose} disabled={importing}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white transition-all disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleImport} disabled={importing || selectedIds.size === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {importing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                  : <><UploadCloud className="w-4 h-4" /> Import{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}</>}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImportSubaccountsModal;
