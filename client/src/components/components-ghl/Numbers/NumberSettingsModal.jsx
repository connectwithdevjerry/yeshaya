// src/components/components-ghl/Numbers/NumberSettingsModal.jsx
import React, { useEffect, useState } from "react";
import { X, Loader2, Check, Phone, Star, Pencil, Scale, Eye, Wifi, WifiOff, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import apiClient from "../../../store/api/config";

const ROLES = ["owner", "admin", "member", "viewer"];

const SECTION_META = {
  rename:      { title: "Rename Number",   icon: Star },
  account:     { title: "Edit Account",    icon: Pencil },
  limits:      { title: "Manage Limits",   icon: Scale },
  permissions: { title: "Edit Permissions",icon: Eye },
  assistant:   { title: "Change Assistant",icon: Bot },
  details:     { title: "Number Details",  icon: Phone },
};

const NumberSettingsModal = ({ section, account, onClose }) => {
  const open = !!section && !!account;
  const phoneSid = account?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({
    label: "", notes: "",
    limits: { maxCallsPerDay: 0, monthlyBudget: 0 },
    permissions: { allowedRoles: ["owner", "admin", "member"] },
  });

  const vapiInfo = useSelector((s) => s.numbers?.vapiStatuses?.[phoneSid]);
  const isConnected = vapiInfo?.isConnected === true;

  // Change-assistant section state
  const [assistants, setAssistants]     = useState([]);
  const [assistantId, setAssistantId]   = useState(account?.assistantId || "");
  const [reassigning, setReassigning]   = useState(false);

  useEffect(() => {
    if (section !== "assistant" || !account?.companyId) return;
    apiClient.get(`/assistants/get-all?subaccountId=${account.companyId}`)
      .then((res) => { if (res.data.status) setAssistants(res.data.data || []); })
      .catch(() => {});
    setAssistantId(account?.assistantId || "");
  }, [section, account]);

  const handleReassign = async () => {
    if (!assistantId) { toast.error("Pick an assistant"); return; }
    if (assistantId === account?.assistantId) { toast("No change"); onClose(); return; }
    setReassigning(true);
    try {
      const res = await apiClient.post("/integrations/reassign-number", {
        subaccountId: account.companyId, phoneSid, toAssistantId: assistantId,
      });
      if (res.data.status) { toast.success("Number reassigned"); onClose(); }
      else toast.error(res.data.message || "Failed to reassign");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reassign");
    } finally { setReassigning(false); }
  };

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiClient.get(`/integrations/number-settings?phoneSid=${phoneSid}`)
      .then((res) => {
        if (res.data.status) {
          const d = res.data.data;
          setForm({
            label: d.label || "",
            notes: d.notes || "",
            limits: { maxCallsPerDay: d.limits?.maxCallsPerDay || 0, monthlyBudget: d.limits?.monthlyBudget || 0 },
            permissions: { allowedRoles: d.permissions?.allowedRoles || ["owner", "admin", "member"] },
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, phoneSid]);

  if (!open) return null;
  const Meta = SECTION_META[section] || SECTION_META.details;
  const Icon = Meta.icon;

  const save = async (payload) => {
    setSaving(true);
    try {
      const res = await apiClient.post("/integrations/number-settings", { phoneSid, ...payload });
      if (res.data.status) { toast.success("Saved"); onClose(); }
      else toast.error(res.data.message || "Failed to save");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const toggleRole = (r) =>
    setForm((f) => {
      const has = f.permissions.allowedRoles.includes(r);
      const allowedRoles = has ? f.permissions.allowedRoles.filter((x) => x !== r) : [...f.permissions.allowedRoles, r];
      return { ...f, permissions: { allowedRoles } };
    });

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{Meta.title}</h3>
                <p className="text-[11px] font-mono text-gray-400">{account.phoneNumber}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : section === "rename" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Display name</label>
                <input autoFocus value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder={account.name || "e.g. Sales line"} className={inputCls} />
              </div>
            ) : section === "account" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Display name</label>
                  <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder={account.name} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Notes</label>
                  <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Internal notes about this number…" className={`${inputCls} resize-none`} />
                </div>
                <div className="text-[11px] text-gray-400">Linked assistant: <span className="font-medium text-gray-600">{account.assistantName || "—"}</span></div>
              </>
            ) : section === "limits" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Max calls per day <span className="text-gray-400">(0 = unlimited)</span></label>
                  <input type="number" min="0" value={form.limits.maxCallsPerDay}
                    onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, maxCallsPerDay: Number(e.target.value) } }))} className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Monthly budget (USD) <span className="text-gray-400">(0 = unlimited)</span></label>
                  <input type="number" min="0" value={form.limits.monthlyBudget}
                    onChange={(e) => setForm((f) => ({ ...f, limits: { ...f.limits, monthlyBudget: Number(e.target.value) } }))} className={inputCls} />
                </div>
                <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2">Limits are saved as configuration. Enforcement during live calls is coming soon.</p>
              </>
            ) : section === "permissions" ? (
              <>
                <label className="text-xs font-semibold text-gray-600">Roles allowed to use this number</label>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <label key={r} className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
                      <span className="text-sm capitalize text-gray-700">{r}</span>
                      <input type="checkbox" checked={form.permissions.allowedRoles.includes(r)} onChange={() => toggleRole(r)} className="accent-indigo-500 w-4 h-4" />
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2">Saved as configuration. Access enforcement is coming soon.</p>
              </>
            ) : section === "assistant" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Assigned assistant</label>
                  <select
                    value={assistantId}
                    onChange={(e) => setAssistantId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select an assistant…</option>
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>{a.name || a.id}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-gray-400">
                  Currently: <span className="font-medium text-gray-600">{account?.assistantName || "External / unassigned"}</span>.
                  Reassigning updates the number's routing in Vapi and Twilio.
                </p>
              </>
            ) : (
              /* details (read-only) */
              <div className="space-y-2.5 text-sm">
                {[
                  ["Name", form.label || account.name || "Unnamed"],
                  ["Number", account.phoneNumber],
                  ["SID", account.id],
                  ["Linked assistant", account.assistantName || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3">
                    <span className="text-xs text-gray-400">{k}</span>
                    <span className="text-xs font-medium text-gray-700 text-right break-all">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Vapi status</span>
                  {isConnected
                    ? <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><Wifi className="w-3 h-3" /> Connected</span>
                    : <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-400"><WifiOff className="w-3 h-3" /> Not connected</span>}
                </div>
                {form.notes && <div className="pt-2 border-t border-gray-50"><p className="text-[11px] text-gray-400 mb-1">Notes</p><p className="text-xs text-gray-600">{form.notes}</p></div>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              {section === "details" ? "Close" : "Cancel"}
            </button>
            {section === "assistant" ? (
              <button
                onClick={handleReassign}
                disabled={reassigning}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
              >
                {reassigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Reassign
              </button>
            ) : section !== "details" && (
              <button
                onClick={() => save(
                  section === "rename"      ? { label: form.label } :
                  section === "account"     ? { label: form.label, notes: form.notes } :
                  section === "limits"      ? { limits: form.limits } :
                  /* permissions */           { permissions: form.permissions }
                )}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NumberSettingsModal;
