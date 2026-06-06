// src/components/components-ghl/AssistantsBuilder/components/TemplatesPanel.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, FileText, Sparkles, Trash2, Pencil, History,
  ArrowLeft, Check, Loader2, Lock, RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchTemplates, createTemplate, updateTemplate, deleteTemplate,
  restoreTemplateVersion, saveFromPrompt,
} from "../../../../store/slices/templateSlice";

// client-side variable fill
const extractVars = (body = "") => {
  const set = new Set();
  (body.match(/{{\s*([^}]+)\s*}}/g) || []).forEach((m) => set.add(m.replace(/[{}]/g, "").trim()));
  return [...set];
};
const fill = (body, values) => body.replace(/{{\s*([^}]+)\s*}}/g, (m, k) => values[k.trim()] ?? "");

const CATEGORIES = ["Custom", "Receptionist", "Sales", "Support"];

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all";

export default function TemplatesPanel({ onUse, currentPrompt }) {
  const dispatch = useDispatch();
  const { items: templates, loading } = useSelector((s) => s.templates);

  const [view, setView]       = useState("list"); // list | fill | edit | history
  const [active, setActive]   = useState(null);    // selected template
  const [search, setSearch]   = useState("");
  const [busy, setBusy]       = useState(false);

  // fill state
  const [values, setValues] = useState({});
  // edit/create state
  const [form, setForm] = useState({ name: "", category: "Custom", description: "", promptBody: "" });

  useEffect(() => { dispatch(fetchTemplates()); }, [dispatch]);

  const filtered = (templates || []).filter((t) => {
    const q = search.toLowerCase();
    return !q || t.name.toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q);
  });

  // ── handlers ──
  const openFill = (tpl) => {
    setActive(tpl);
    const init = {};
    (tpl.variables || []).forEach((v) => { init[v.key] = v.defaultValue || ""; });
    setValues(init);
    setView("fill");
  };

  const openCreate = (seedFromCurrent = false) => {
    setActive(null);
    setForm({
      name: "", category: "Custom", description: "",
      promptBody: seedFromCurrent ? (currentPrompt || "") : "",
    });
    setView("edit");
  };

  const openEdit = (tpl) => {
    setActive(tpl);
    setForm({ name: tpl.name, category: tpl.category || "Custom", description: tpl.description || "", promptBody: tpl.promptBody || "" });
    setView("edit");
  };

  const handleUse = () => {
    if (!active) return;
    const prompt = fill(active.promptBody, values);
    onUse(prompt);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.promptBody.trim()) { toast.error("Name and prompt are required"); return; }
    setBusy(true);
    try {
      if (active && !active.isSystem) {
        await dispatch(updateTemplate({ id: active._id, ...form })).unwrap();
        toast.success("Template updated");
      } else {
        await dispatch(createTemplate(form)).unwrap();
        toast.success("Template created");
      }
      setView("list");
    } catch (err) { toast.error(err || "Failed to save"); }
    finally { setBusy(false); }
  };

  const handleDelete = async (tpl) => {
    if (!window.confirm(`Delete template "${tpl.name}"?`)) return;
    try { await dispatch(deleteTemplate(tpl._id)).unwrap(); toast.success("Deleted"); }
    catch (err) { toast.error(err || "Failed"); }
  };

  const handleRestore = async (versionId) => {
    try {
      const updated = await dispatch(restoreTemplateVersion({ id: active._id, versionId })).unwrap();
      setActive(updated);
      toast.success("Version restored");
      setView("list");
    } catch (err) { toast.error(err || "Failed"); }
  };

  // ── views ──
  if (view === "fill" && active) {
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to templates
        </button>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{active.name}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{active.description}</p>
        </div>

        {(active.variables || []).length === 0 ? (
          <p className="text-xs text-gray-400">This template has no variables — use it as-is.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {active.variables.map((v) => (
              <div key={v.key} className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">{v.label || v.key}</label>
                <input
                  value={values[v.key] ?? ""}
                  onChange={(e) => setValues((p) => ({ ...p, [v.key]: e.target.value }))}
                  placeholder={`{{${v.key}}}`}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        )}

        {/* live preview */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 max-h-32 overflow-y-auto">
          <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Preview</p>
          <p className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">{fill(active.promptBody, values)}</p>
        </div>

        <button onClick={handleUse}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all">
          <Check className="w-4 h-4" /> Use This Template
        </button>
      </div>
    );
  }

  if (view === "edit") {
    const vars = extractVars(form.promptBody);
    return (
      <div className="space-y-4">
        <button onClick={() => setView("list")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dental Receptionist" className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" className={inputCls} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Prompt Body — use {"{{variables}}"} for placeholders</label>
          <textarea value={form.promptBody} onChange={(e) => setForm({ ...form, promptBody: e.target.value })} rows={8}
            placeholder="You are an assistant for {{businessName}}…"
            className={`${inputCls} font-mono leading-relaxed resize-none`} />
        </div>
        {vars.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[11px] text-gray-400">Detected variables:</span>
            {vars.map((v) => <span key={v} className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">{v}</span>)}
          </div>
        )}
        <button onClick={handleSave} disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {active && !active.isSystem ? "Save Changes" : "Create Template"}
        </button>
      </div>
    );
  }

  if (view === "history" && active) {
    return (
      <div className="space-y-3">
        <button onClick={() => setView("list")} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <h4 className="text-sm font-bold text-gray-900">Version History — {active.name}</h4>
        {(active.versions || []).length === 0 ? (
          <p className="text-xs text-gray-400">No previous versions yet.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {[...active.versions].reverse().map((v) => (
              <div key={v._id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-gray-400">{new Date(v.savedAt).toLocaleString()}</span>
                  <button onClick={() => handleRestore(v._id)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                    <RotateCcw className="w-3 h-3" /> Restore
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 font-mono line-clamp-2">{v.promptBody}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // list view
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
        {currentPrompt && (
          <button onClick={() => openCreate(true)} title="Save current prompt as template"
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Save current
          </button>
        )}
        <button onClick={() => openCreate(false)}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-md hover:brightness-110 inline-flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {loading && templates.length === 0 ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="w-7 h-7 text-gray-200 mb-2" />
          <p className="text-sm text-gray-500">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {filtered.map((tpl) => (
            <motion.div key={tpl._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="group rounded-xl border border-gray-100 p-3.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => openFill(tpl)} className="text-left flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-800 truncate">{tpl.name}</p>
                    {tpl.isSystem && <Lock className="w-3 h-3 text-gray-300" title="System template" />}
                  </div>
                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 mt-1">{tpl.category}</span>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{tpl.description}</p>
                </button>
              </div>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openFill(tpl)} className="flex-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 py-1">Use →</button>
                {!tpl.isSystem && <>
                  <button onClick={() => openEdit(tpl)} title="Edit" className="p-1 rounded text-gray-300 hover:text-gray-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setActive(tpl); setView("history"); }} title="History" className="p-1 rounded text-gray-300 hover:text-gray-600"><History className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(tpl)} title="Delete" className="p-1 rounded text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
