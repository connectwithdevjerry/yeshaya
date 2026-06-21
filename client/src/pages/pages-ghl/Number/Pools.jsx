// src/pages/pages-ghl/Number/Pools.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Layers, Phone, Trash2, Pencil, Settings2, Loader2,
  X, Check, Search, Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchPools, createPool, renamePool, deletePool, setPoolNumbers,
} from "../../../store/slices/poolSlice";
import { fetchAssistants } from "../../../store/slices/assistantsSlice";
import { fetchPurchasedNumbers } from "../../../store/slices/numberSlice";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// ─── Create / Rename Pool Modal ───────────────────────────────────────────────
const NameModal = ({ title, initial = "", onSave, onClose, saving }) => {
  const [name, setName] = useState(initial);
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-6 py-5">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pool Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales Outbound" autoFocus
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button onClick={() => onSave(name)} disabled={saving || !name.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Assign Numbers Modal ─────────────────────────────────────────────────────
const AssignModal = ({ pool, numbers, onSave, onClose, saving }) => {
  const [selected, setSelected] = useState(new Set(pool.numberSids || []));
  const [q, setQ] = useState("");

  const toggle = (sid) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(sid) ? next.delete(sid) : next.add(sid);
    return next;
  });

  const filtered = numbers.filter((n) => {
    const s = q.toLowerCase();
    return !s || (n.phoneNumber || "").toLowerCase().includes(s) || (n.friendlyName || "").toLowerCase().includes(s);
  });

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Assign Numbers</h3>
              <p className="text-xs text-gray-400 mt-0.5">to "{pool.name}"</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>

          <div className="px-6 py-3 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search numbers…"
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <Phone className="w-7 h-7 mb-2 text-gray-200" />
                <p className="text-sm">No numbers found</p>
                <p className="text-xs mt-0.5">Buy or import numbers first.</p>
              </div>
            ) : filtered.map((n) => {
              const isSel = selected.has(n.sid);
              return (
                <button key={n.sid} onClick={() => toggle(n.sid)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all text-left ${isSel ? "bg-indigo-50/60" : "hover:bg-gray-50"}`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSel ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0"><Phone className="w-3.5 h-3.5 text-indigo-500" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 font-mono">{n.phoneNumber}</p>
                    {n.friendlyName && <p className="text-[11px] text-gray-400 truncate">{n.friendlyName}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-500"><span className="font-semibold text-indigo-600">{selected.size}</span> selected</span>
            <div className="flex gap-3">
              <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button onClick={() => onSave([...selected])} disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export function NumberPool() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = searchParams.get("subaccount");

  const { items: pools, loading } = useSelector((s) => s.pools);
  const { data: assistants } = useSelector((s) => s.assistants);

  const [numbers, setNumbers] = useState([]); // flat list { sid, phoneNumber, friendlyName }
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchPools(subaccountId));
      dispatch(fetchAssistants(subaccountId));
    }
  }, [dispatch, subaccountId]);

  // Build the available numbers list (same source as the Numbers page)
  useEffect(() => {
    const load = async () => {
      if (!subaccountId || !assistants?.length) return;
      try {
        const results = await Promise.all(
          assistants.map((a) => dispatch(fetchPurchasedNumbers({ subaccountId, assistantId: a.id })).unwrap())
        );
        const flat = results.flat().map((n) => n.phoneNumberDetails).filter(Boolean);
        const unique = flat.reduce((acc, d) => {
          if (d?.sid && !acc.find((x) => x.sid === d.sid)) acc.push({ sid: d.sid, phoneNumber: d.phoneNumber, friendlyName: d.friendlyName });
          return acc;
        }, []);
        setNumbers(unique);
      } catch (e) { /* ignore */ }
    };
    load();
  }, [dispatch, subaccountId, assistants]);

  const numberLabel = (sid) => numbers.find((n) => n.sid === sid)?.phoneNumber || `${sid.slice(0, 10)}…`;

  const handleCreate = async (name) => {
    setBusy(true);
    try { await dispatch(createPool({ subaccountId, name })).unwrap(); toast.success("Pool created"); setCreateOpen(false); }
    catch (err) { toast.error(err || "Failed"); } finally { setBusy(false); }
  };
  const handleRename = async (name) => {
    setBusy(true);
    try { await dispatch(renamePool({ subaccountId, poolId: renameTarget.poolId, name })).unwrap(); toast.success("Renamed"); setRenameTarget(null); }
    catch (err) { toast.error(err || "Failed"); } finally { setBusy(false); }
  };
  const handleDelete = async (poolId, name) => {
    if (!window.confirm(`Delete pool "${name}"? Numbers stay, just unassigned.`)) return;
    try { await dispatch(deletePool({ subaccountId, poolId })).unwrap(); toast.success("Pool deleted"); }
    catch (err) { toast.error(err || "Failed"); }
  };
  const handleAssign = async (numberSids) => {
    setBusy(true);
    try { await dispatch(setPoolNumbers({ subaccountId, poolId: assignTarget.poolId, numberSids })).unwrap(); toast.success("Numbers updated"); setAssignTarget(null); }
    catch (err) { toast.error(err || "Failed"); } finally { setBusy(false); }
  };

  return (
    <div className="flex-grow bg-gray-50/40 p-6 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" /> Number Pools
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Group your phone numbers for organization</p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all">
            <Plus className="w-4 h-4" /> New Pool
          </button>
        </div>

        {/* Pools grid */}
        {loading && pools.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
        ) : pools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3"><Layers className="w-6 h-6 text-indigo-300" /></div>
            <p className="text-sm font-semibold text-gray-700">No pools yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-5 max-w-xs">Create a pool to group related phone numbers together.</p>
            <button onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all">
              <Plus className="w-4 h-4" /> Create Pool
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pools.map((pool, idx) => (
              <motion.div key={pool.poolId}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-600" />
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Layers className="w-5 h-5 text-indigo-500" /></div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setRenameTarget(pool)} title="Rename" className="p-1.5 rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(pool.poolId, pool.name)} title="Delete" className="p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 truncate">{pool.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> {pool.numberCount} number{pool.numberCount !== 1 ? "s" : ""} · {fmtDate(pool.createdAt)}
                  </p>

                  {/* number chips */}
                  {pool.numberSids?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {pool.numberSids.slice(0, 4).map((sid) => (
                        <span key={sid} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-500">{numberLabel(sid)}</span>
                      ))}
                      {pool.numberSids.length > 4 && <span className="text-[10px] px-2 py-0.5 rounded-lg bg-gray-50 text-gray-400">+{pool.numberSids.length - 4}</span>}
                    </div>
                  )}
                </div>
                <div className="px-5 py-3 border-t border-gray-50">
                  <button onClick={() => setAssignTarget(pool)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Settings2 className="w-3.5 h-3.5" /> Manage Numbers
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {createOpen && <NameModal title="New Pool" onSave={handleCreate} onClose={() => setCreateOpen(false)} saving={busy} />}
      {renameTarget && <NameModal title="Rename Pool" initial={renameTarget.name} onSave={handleRename} onClose={() => setRenameTarget(null)} saving={busy} />}
      {assignTarget && <AssignModal pool={assignTarget} numbers={numbers} onSave={handleAssign} onClose={() => setAssignTarget(null)} saving={busy} />}
    </div>
  );
}

export default NumberPool;
