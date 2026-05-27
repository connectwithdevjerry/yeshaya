// src/components/components-ui/Agency/AdminTab.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Mail, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getAdminSettings, saveAdminSettings } from "../../../store/slices/authSlice";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400";

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
    {children}
  </div>
);

export default function AdminTab() {
  const dispatch = useDispatch();
  const { adminSettings, adminLoading } = useSelector((s) => s.auth);

  const [password,       setPassword]       = useState("");
  const [showPass,       setShowPass]       = useState(false);
  const [resendKey,      setResendKey]      = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [showResendKey,  setShowResendKey]  = useState(false);

  useEffect(() => {
    dispatch(getAdminSettings());
  }, [dispatch]);

  const resendConfigured = adminSettings?.resendConfigured ?? false;

  const handleSave = async () => {
    const payload = {};
    if (password)  payload.adminLockPassword = password;
    if (resendKey) payload.resendApiKey      = resendKey;

    if (!Object.keys(payload).length) {
      toast("Nothing to save — enter a password or Resend API key.", { icon: "ℹ️" });
      return;
    }

    try {
      await dispatch(saveAdminSettings(payload)).unwrap();
      toast.success("Admin settings saved!");
      setPassword("");
      setResendKey("");
      setShowResendForm(false);
      dispatch(getAdminSettings());
    } catch (err) {
      toast.error(err || "Failed to save admin settings");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-gray-900">Admin Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage security and email delivery configuration.</p>
      </div>

      <div className="space-y-6">

        {/* ── Admin lock password ── */}
        <Field
          label="Admin Lock Password"
          hint={adminSettings?.hasAdminPassword
            ? "A password is set. Enter a new one to replace it."
            : "Protect admin-only areas with a secondary password."}
        >
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={adminSettings?.hasAdminPassword ? "Enter new password to change…" : "••••••••"}
              className={`${inputCls} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>

        {/* ── Divider ── */}
        <div className="border-t border-gray-100" />

        {/* ── Resend API ── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-800">Resend API</span>
                {resendConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100 font-semibold">
                    Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Used to send transactional emails (invites, alerts) through your own Resend account.
              </p>
            </div>

            <button
              onClick={() => setShowResendForm((p) => !p)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {resendConfigured ? "Update Key" : "Configure Resend"}
            </button>
          </div>

          {/* Resend API key input (shown when configure clicked) */}
          {showResendForm && (
            <div className="relative">
              <input
                type={showResendKey ? "text" : "password"}
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
                placeholder="re_••••••••••••••••••••••••"
                className={`${inputCls} pr-10 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowResendKey((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                {showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Save ── */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={adminLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {adminLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
