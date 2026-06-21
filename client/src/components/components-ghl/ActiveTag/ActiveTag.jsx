// src/components/components-ghl/ActiveTag/ActiveTag.jsx
import React, { useState } from "react";
import { X, Info, Loader2, Tag as TagIcon } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../store/api/config";

const CreateActiveTagModal = ({ isOpen, onClose, subaccountId, assistants = [], onCreated }) => {
  const [name, setName]               = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [saving, setSaving]           = useState(false);

  if (!isOpen) return null;

  const reset = () => { setName(""); setAssistantId(""); setInstruction(""); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Enter a tag name"); return; }
    if (!subaccountId) { toast.error("No sub-account selected"); return; }
    setSaving(true);
    try {
      const assistant = assistants.find((a) => a.id === assistantId);
      const res = await apiClient.post("/active-tags", {
        subaccountId,
        name: name.trim(),
        assistantId,
        assistantName: assistant?.name || "",
        instruction: instruction.trim(),
      });
      if (res.data.status) {
        toast.success("Active tag created");
        reset();
        onCreated?.();
        onClose();
      } else {
        toast.error(res.data.message || "Failed to create");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center"><TagIcon className="w-4 h-4 text-indigo-500" /></div>
            <h3 className="text-sm font-bold text-gray-800">Create Active Tag</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              Tag name <Info className="w-3 h-3 text-gray-300" title="The GoHighLevel tag the assistant will apply" />
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. qualified-lead" autoFocus className={inputCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Linked assistant (optional)</label>
            <select value={assistantId} onChange={(e) => setAssistantId(e.target.value)} className={inputCls}>
              <option value="">Any / unassigned</option>
              {assistants.map((a) => <option key={a.id} value={a.id}>{a.name || a.id}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">When should the assistant apply it? (optional)</label>
            <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={3}
              placeholder="e.g. Apply when the caller expresses strong interest or asks for pricing." className={`${inputCls} resize-none`} />
          </div>

          <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg p-2.5 leading-relaxed">
            Active tags are applied to contacts by the assistant's <span className="font-mono">Add Tag</span> tool during calls.
            Make sure that tool is enabled on the assistant (Toolkit → Tools &amp; APIs → Add tag).
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActiveTagModal;
