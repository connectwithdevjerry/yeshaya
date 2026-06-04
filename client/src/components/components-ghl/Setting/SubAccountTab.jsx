// src/components/components-ghl/Setting/SubAccountTab.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Copy, Check, Loader2, Bot, Users, Phone,
  CheckCircle2, XCircle, Save, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import {
  fetchSubAccountDetails,
  updateSubAccountMeta,
} from "../../../store/slices/integrationSlice";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-lg font-bold text-gray-900 leading-none tabular-nums">{value}</p>
      <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

const SubAccountTab = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const { subAccountDetails, fetchingSubAccountDetails } = useSelector(
    (s) => s.integrations || {}
  );

  const [customName, setCustomName] = useState("");
  const [notes,      setNotes]      = useState("");
  const [copied,     setCopied]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [dirty,      setDirty]      = useState(false);

  useEffect(() => {
    if (subaccountId) dispatch(fetchSubAccountDetails(subaccountId));
  }, [dispatch, subaccountId]);

  useEffect(() => {
    if (subAccountDetails) {
      setCustomName(subAccountDetails.customName || "");
      setNotes(subAccountDetails.notes || "");
      setDirty(false);
    }
  }, [subAccountDetails]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(subaccountId || "");
    setCopied(true);
    toast.success("Location ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateSubAccountMeta({ id: subaccountId, customName, notes })).unwrap();
      toast.success("Sub-account settings saved");
      setDirty(false);
    } catch (err) {
      toast.error(err || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!subaccountId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
        <p className="text-sm font-medium text-gray-600">No sub-account context</p>
        <p className="text-xs text-gray-400 mt-1">This page must be opened from within a sub-account.</p>
      </div>
    );
  }

  if (fetchingSubAccountDetails && !subAccountDetails) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  const connected = subAccountDetails?.connected;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800">Sub-account Settings</h3>
          <p className="text-xs text-gray-500">Manage settings for this location.</p>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-semibold">
            <XCircle className="w-3 h-3" /> Not connected
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon={Bot}   label="Assistants" value={subAccountDetails?.assistantCount ?? 0} color="bg-indigo-50 text-indigo-500" />
        <StatCard icon={Users} label="Contacts"   value={subAccountDetails?.contactCount   ?? 0} color="bg-violet-50 text-violet-500" />
        <StatCard icon={Phone} label="Numbers"    value={subAccountDetails?.numberCount    ?? 0} color="bg-emerald-50 text-emerald-500" />
      </div>

      {/* Display name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800">Display Name</label>
        <p className="text-xs text-gray-500">A friendly label for this sub-account (visible in your agency dashboard).</p>
        <input
          type="text"
          value={customName}
          onChange={(e) => { setCustomName(e.target.value); setDirty(true); }}
          placeholder="e.g. Coastal Realty Group"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
          placeholder="Add internal notes about this account…"
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
        />
      </div>

      {/* Location ID (read-only) */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800">Location ID</label>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-mono text-gray-600 truncate">
            {subaccountId}
          </code>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {dirty && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default SubAccountTab;
