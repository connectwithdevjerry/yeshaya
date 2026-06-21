// src/components/components-ui/Agency/SnapShot/Resources.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Bot, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getSnapshot, saveSnapshot } from "../../../../store/slices/authSlice";

const inputCls =
  "flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400 font-mono";

export default function ResourcesTab() {
  const dispatch = useDispatch();
  const { snapshot, snapshotLoading } = useSelector((s) => s.auth);

  const [assistantId, setAssistantId] = useState("");
  const [snapshots,   setSnapshots]   = useState([]);

  useEffect(() => {
    dispatch(getSnapshot());
  }, [dispatch]);

  useEffect(() => {
    if (snapshot?.resources) setSnapshots(snapshot.resources);
  }, [snapshot]);

  const handleAdd = () => {
    const trimmed = assistantId.trim();
    if (!trimmed || snapshots.includes(trimmed)) return;
    setSnapshots((p) => [...p, trimmed]);
    setAssistantId("");
  };

  const handleRemove = (id) => setSnapshots((p) => p.filter((s) => s !== id));

  const handleKeyDown = (e) => { if (e.key === "Enter") handleAdd(); };

  const handleSave = async () => {
    try {
      await dispatch(saveSnapshot({ resources: snapshots })).unwrap();
      toast.success("Resource snapshots saved!");
    } catch (err) {
      toast.error(err || "Failed to save resources");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Assistant Snapshots</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          These assistants will be automatically added to new sub-accounts on creation.
        </p>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Paste assistant ID to snapshot…"
          value={assistantId}
          onChange={(e) => setAssistantId(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputCls}
        />
        <button
          onClick={handleAdd}
          disabled={!assistantId.trim()}
          title="Add snapshot"
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Snapshot list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {snapshots.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center text-gray-400"
            >
              <Bot className="w-8 h-8 mb-2 text-gray-200" />
              <p className="text-xs">No snapshots added yet.</p>
            </motion.div>
          )}
          {snapshots.map((id) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="flex-1 text-sm font-mono text-gray-700 truncate">{id}</span>
              <button
                onClick={() => handleRemove(id)}
                className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={snapshotLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60"
        >
          {snapshotLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
