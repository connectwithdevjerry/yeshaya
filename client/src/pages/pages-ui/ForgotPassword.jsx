import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthLayout from "../../components/auth/AuthLayout";

/* ── Password strength ── */
const getStrength = (pw) => {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    { label: "Too short",  color: "bg-red-400",     w: "w-1/4" },
    { label: "Weak",       color: "bg-red-400",     w: "w-1/4" },
    { label: "Fair",       color: "bg-amber-400",   w: "w-2/4" },
    { label: "Good",       color: "bg-blue-400",    w: "w-3/4" },
    { label: "Strong",     color: "bg-emerald-500", w: "w-full" },
  ];
  return levels[pw.length < 8 ? 0 : s];
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate  = useNavigate();
  const BaseUrl   = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({ newPassword: "", cnewPassword: "" });
  const [showNew,  setShowNew]  = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");
  const [status,   setStatus]   = useState(null); // "success" | "error"

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const passwordsMatch = formData.newPassword && formData.cnewPassword &&
    formData.newPassword === formData.cnewPassword;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!passwordsMatch) { setMessage("Passwords do not match"); setStatus("error"); return; }
    setLoading(true); setMessage("");
    try {
      const res = await axios.post(`${BaseUrl}/auth/reset_password`, {
        token, newPassword: formData.newPassword, cnewPassword: formData.cnewPassword,
      });
      setMessage(res.data.message || "Password reset successful!");
      setStatus("success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Password reset failed. Please try again.");
      setStatus("error");
    } finally { setLoading(false); }
  };

  const strength = getStrength(formData.newPassword);

  return (
    <AuthLayout
      panelTitle="Create a strong new password."
      panelSubtitle="Choose a new password for your account. Use a mix of letters, numbers and symbols for best security."
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full mb-4">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-600">Secure password reset</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
        <p className="text-gray-500 text-sm mt-1.5">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      {/* Success state */}
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Password updated!</h3>
            <p className="text-gray-500 text-sm mb-1">{message}</p>
            <p className="text-gray-400 text-xs">Redirecting you to sign in…</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Error */}
            <AnimatePresence>
              {status === "error" && message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                >
                  <span>⚠</span> {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">New password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {strength && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`} />
                  </div>
                  <p className="text-xs text-gray-400">Strength: <span className="font-medium text-gray-600">{strength.label}</span></p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
              <div className="relative">
                <input
                  type={showCon ? "text" : "password"}
                  name="cnewPassword"
                  value={formData.cnewPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter new password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:ring-4
                    ${formData.cnewPassword
                      ? passwordsMatch
                        ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10"
                        : "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10"
                    }`}
                />
                <button type="button" onClick={() => setShowCon(!showCon)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showCon ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {formData.cnewPassword && (
                <p className={`text-xs ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                  {passwordsMatch ? "✓ Passwords match" : "Passwords don't match"}
                </p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !passwordsMatch}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm
                bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25
                hover:shadow-indigo-500/40 hover:brightness-110
                disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Updating password…</>
              ) : (
                "Update password"
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all duration-150"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ResetPassword;
