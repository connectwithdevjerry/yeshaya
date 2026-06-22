// src/components/components-ghl/Widgets/CreateWidgetModal.jsx
import React, { useEffect, useState } from "react";
import { X, MessageSquare, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createWidget, updateWidget } from "../../../store/slices/widgetSlice";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white";

const COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#111827"];

const emptyTheme = {
  primaryColor: "#6366f1",
  position: "bottom-right",
  title: "Chat with us",
  greeting: "Hi! How can I help you today?",
  launcherText: "",
};

const CreateWidgetModal = ({ isOpen, onClose, subaccountId, editing }) => {
  const dispatch = useDispatch();
  const assistants = useSelector((s) => s.assistants?.data || []);
  const saving = useSelector((s) => s.widgets?.saving);

  const [name, setName] = useState("");
  const [assistantId, setAssistantId] = useState("");
  const [theme, setTheme] = useState(emptyTheme);
  const [domains, setDomains] = useState("");

  useEffect(() => {
    if (editing) {
      setName(editing.name || "");
      setAssistantId(editing.assistantId || "");
      setTheme({ ...emptyTheme, ...(editing.theme || {}) });
      setDomains((editing.allowedDomains || []).join(", "));
    } else {
      setName("");
      setAssistantId("");
      setTheme(emptyTheme);
      setDomains("");
    }
  }, [editing, isOpen]);

  if (!isOpen) return null;

  const setT = (k, v) => setTheme((t) => ({ ...t, [k]: v }));

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Give your widget a name");
    if (!assistantId) return toast.error("Select an assistant to link");

    const assistantName = assistants.find((a) => a.id === assistantId)?.name || "";
    const allowedDomains = domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const payload = { name: name.trim(), assistantId, assistantName, subaccountId, theme, allowedDomains };

    try {
      if (editing) {
        await dispatch(updateWidget({ id: editing._id, ...payload })).unwrap();
        toast.success("Widget updated");
      } else {
        await dispatch(createWidget(payload)).unwrap();
        toast.success("Widget created");
      }
      onClose();
    } catch (err) {
      toast.error(err || "Failed to save widget");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {editing ? "Edit Chat Widget" : "Create Chat Widget"}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Widget name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Support Bot" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Linked assistant</label>
            <select value={assistantId} onChange={(e) => setAssistantId(e.target.value)} className={inputCls}>
              <option value="">Select an assistant…</option>
              {assistants.map((a) => (
                <option key={a.id} value={a.id}>{a.name || a.id}</option>
              ))}
            </select>
            {assistants.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">No assistants found for this sub-account.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Header title</label>
              <input value={theme.title} onChange={(e) => setT("title", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Position</label>
              <select value={theme.position} onChange={(e) => setT("position", e.target.value)} className={inputCls}>
                <option value="bottom-right">Bottom right</option>
                <option value="bottom-left">Bottom left</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Greeting message</label>
            <input value={theme.greeting} onChange={(e) => setT("greeting", e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Launcher label <span className="font-normal text-gray-400">(optional)</span></label>
            <input value={theme.launcherText} onChange={(e) => setT("launcherText", e.target.value)} placeholder="e.g. Need help?" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Accent color</label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setT("primaryColor", c)}
                  className={`w-7 h-7 rounded-full border-2 transition ${theme.primaryColor === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input type="color" value={theme.primaryColor} onChange={(e) => setT("primaryColor", e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-gray-200" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Allowed domains <span className="font-normal text-gray-400">(comma-separated)</span>
            </label>
            <input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="acme.com, app.acme.com" className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">
              Leave empty to allow any site. Restricting domains prevents others from embedding your widget and spending your balance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-5 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editing ? "Save changes" : "Create widget"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWidgetModal;
