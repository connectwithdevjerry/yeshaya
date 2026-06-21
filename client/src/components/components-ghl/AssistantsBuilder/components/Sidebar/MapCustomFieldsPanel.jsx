// src/components/.../Sidebar/MapCustomFieldsPanel.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Loader2, Check, AlertCircle, MapPin, Plug, Search } from "lucide-react";
import toast from "react-hot-toast";
import { fetchGhlCustomFields, saveCustomFieldMap } from "../../../../../store/slices/assistantsSlice";
import { authorizeGoHighLevel } from "../../../../../store/slices/integrationSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

export const MapCustomFieldsPanel = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [fields, setFields]       = useState([]);
  const [selected, setSelected]   = useState({}); // fieldId → { ...field, instruction }
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [reconnect, setReconnect] = useState(false);
  const [error, setError]         = useState("");
  const [q, setQ]                 = useState("");
  const [reconnecting, setReconnecting] = useState(false);

  const handleReconnect = async () => {
    if (!subaccountId) { toast.error("Sub-account not found"); return; }
    setReconnecting(true);
    try {
      await dispatch(authorizeGoHighLevel({
        accountId: subaccountId, accountType: "Company", installationType: "directInstallation",
      })).unwrap();
      // redirects to GHL OAuth on success
    } catch (e) {
      toast.error(e?.message || e || "Failed to start reconnection");
      setReconnecting(false);
    }
  };

  useEffect(() => {
    if (!subaccountId || !assistantId) return;
    setLoading(true); setError(""); setReconnect(false);
    dispatch(fetchGhlCustomFields({ subaccountId, assistantId })).unwrap()
      .then((res) => {
        setFields(res.fields || []);
        const sel = {};
        (res.map || []).forEach((m) => { sel[m.id] = m; });
        setSelected(sel);
      })
      .catch((e) => {
        if (String(e).toLowerCase().includes("reconnect")) setReconnect(true);
        else setError(e || "Failed to load custom fields");
      })
      .finally(() => setLoading(false));
  }, [dispatch, subaccountId, assistantId]);

  const toggle = (field) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[field.id]) delete next[field.id];
      else next[field.id] = { id: field.id, name: field.name, fieldKey: field.fieldKey, dataType: field.dataType, instruction: "" };
      return next;
    });
  };

  const setInstruction = (id, instruction) =>
    setSelected((prev) => ({ ...prev, [id]: { ...prev[id], instruction } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(saveCustomFieldMap({ subaccountId, assistantId, map: Object.values(selected) })).unwrap();
      toast.success("Custom field mapping saved");
    } catch (e) {
      toast.error(e || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const visible = fields.filter((f) => f.name?.toLowerCase().includes(q.toLowerCase()));
  const selectedCount = Object.keys(selected).length;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" />
          <div>
            <p className="text-xs font-bold text-gray-700">Map Custom Fields</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Pick which CRM fields the assistant collects on calls.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs text-gray-400">Loading custom fields…</p>
        </div>
      ) : reconnect ? (
        <div className="flex flex-col items-center text-center py-8 gap-3">
          <Plug className="w-6 h-6 text-amber-500" />
          <p className="text-xs text-gray-500">GoHighLevel connection expired. Reconnect to load custom fields.</p>
          <button
            onClick={handleReconnect}
            disabled={reconnecting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold hover:brightness-110 disabled:opacity-60"
          >
            {reconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plug className="w-3.5 h-3.5" />}
            {reconnecting ? "Redirecting…" : "Reconnect GoHighLevel"}
          </button>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center text-center py-8 gap-2">
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      ) : fields.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-8">No custom fields found in this GoHighLevel location.</p>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search fields…"
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {visible.map((f) => {
              const on = !!selected[f.id];
              return (
                <div key={f.id} className={`rounded-xl border p-2.5 transition-all ${on ? "border-indigo-200 bg-indigo-50/40" : "border-gray-100"}`}>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{f.name}</p>
                      <p className="text-[10px] text-gray-400">{f.dataType || "TEXT"}</p>
                    </div>
                    <input type="checkbox" checked={on} onChange={() => toggle(f)} className="accent-indigo-500 w-4 h-4 flex-shrink-0" />
                  </label>
                  {on && (
                    <input
                      value={selected[f.id]?.instruction || ""}
                      onChange={(e) => setInstruction(f.id, e.target.value)}
                      placeholder="How should the AI ask for this? (optional)"
                      className="mt-2 w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save mapping ({selectedCount})
          </button>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Selected fields are written to the contact when the assistant's <span className="font-mono">Update User Details</span> tool runs. Add that tool from the Toolkit and mention these fields in your prompt.
          </p>
        </>
      )}
    </div>
  );
};
