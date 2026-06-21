// src/components/components-ui/Agency/DomainTab.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Globe, Trash2, ArrowUpRight, Copy, Info, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  getDomainSettings,
  saveDomainSettings,
  verifyDomain,
} from "../../../store/slices/authSlice";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-mono placeholder:text-gray-400";

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => toast.success("Copied to clipboard"))
    .catch(() => toast.error("Copy failed"));
};

const CopyButton = ({ value }) => (
  <button
    type="button"
    onClick={() => copyToClipboard(value)}
    title="Copy"
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-indigo-500 transition-colors"
  >
    <Copy className="w-3.5 h-3.5" />
  </button>
);

export default function DomainTab() {
  const dispatch = useDispatch();
  const { domainSettings, domainLoading, domainVerifying } = useSelector((s) => s.auth);

  const [domainName, setDomainName] = useState("");
  const [record, setRecord] = useState({ type: "A", name: "@", value: "76.76.21.21" });

  // Load from API
  useEffect(() => {
    dispatch(getDomainSettings());
  }, [dispatch]);

  // Sync into local state when loaded
  useEffect(() => {
    if (domainSettings) {
      setDomainName(domainSettings.domainName || "");
      if (domainSettings.record) {
        setRecord({
          type:  domainSettings.record.type  || "A",
          name:  domainSettings.record.name  || "@",
          value: domainSettings.record.value || "76.76.21.21",
        });
      }
    }
  }, [domainSettings]);

  const updateRecord = (key, val) =>
    setRecord((p) => ({ ...p, [key]: key === "type" ? val.toUpperCase() : val }));

  const handleSave = async () => {
    try {
      await dispatch(saveDomainSettings({
        domainName,
        recordType:  record.type,
        recordName:  record.name,
        recordValue: record.value,
      })).unwrap();
      toast.success("Domain settings saved");
      dispatch(getDomainSettings());
    } catch (err) {
      toast.error(err || "Failed to save domain settings");
    }
  };

  const handleVerify = async () => {
    try {
      const result = await dispatch(verifyDomain()).unwrap();
      if (result.domainStatus === "active") {
        toast.success("Domain verified and active!");
      } else {
        toast("DNS records not yet propagated — can take up to 48 hours", { icon: "ℹ️" });
      }
    } catch (err) {
      toast.error(err || "Verification failed");
    }
  };

  const isActive = domainSettings?.domainStatus === "active";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-gray-900">Custom Domain</h2>
        <p className="text-sm text-gray-500 mt-0.5">White-label the platform under your own domain or sub-domain.</p>
      </div>

      {/* ── Info banner ── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
        <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-indigo-800 leading-relaxed">
          Connect a white-labeled domain to mask the platform. Use a domain or sub-domain not currently in use.
          DNS records can take up to <strong>48 hours</strong> to propagate.
        </p>
      </div>

      {/* ── Domain name input ── */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800">Your Domain</label>
        <p className="text-xs text-gray-500">The domain or sub-domain you want to connect.</p>
        <input
          type="text"
          value={domainName}
          onChange={(e) => setDomainName(e.target.value)}
          placeholder="app.yourdomain.com"
          className={inputCls}
        />
      </div>

      {/* ── DNS Records ── */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">DNS Records</h3>
          <p className="text-xs text-gray-500 mt-0.5">Add these records to your domain registrar.</p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-3 gap-3 px-1">
          {["Type", "Name", "Value"].map((h) => (
            <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-3 border border-gray-100">
          {["type", "name", "value"].map((key) => (
            <div key={key} className="relative">
              <input
                value={record[key]}
                onChange={(e) => updateRecord(key, e.target.value)}
                className={inputCls}
              />
              <CopyButton value={record[key]} />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleVerify}
            disabled={domainVerifying}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-60"
          >
            {domainVerifying ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…</>
            ) : "Verify Records"}
          </button>

          <button
            onClick={handleSave}
            disabled={domainLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60"
          >
            {domainLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Domain
          </button>
        </div>
      </div>

      {/* ── Connected domain ── */}
      {domainSettings?.domainName && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-800">Connected Domain</h3>
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{domainSettings.domainName}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                Default
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-semibold">
                  <XCircle className="w-3 h-3" /> Not configured
                </span>
              )}
              <button
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open"
                onClick={() => window.open(`https://${domainSettings.domainName}`, "_blank")}
              >
                <ArrowUpRight className="w-4 h-4 text-gray-400 hover:text-indigo-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
