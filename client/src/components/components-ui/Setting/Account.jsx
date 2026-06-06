// src/components/components-ui/Setting/Account.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails, updateUserProfile, requestEmailChange, changePassword } from "../../../store/slices/authSlice";
import { Loader2, User, Lock, Mail, CheckCircle, AlertCircle, X, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ─── Change Password Modal ────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [current, setCurrent] = useState("");
  const [next, setNext]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow]       = useState(false);
  const [busy, setBusy]       = useState(false);

  const handleSubmit = async () => {
    if (!current) { toast.error("Enter your current password"); return; }
    if (next.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (next !== confirm) { toast.error("New passwords don't match"); return; }
    setBusy(true);
    try {
      const msg = await dispatch(changePassword({ currentPassword: current, newPassword: next })).unwrap();
      toast.success(msg || "Password updated");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to change password");
    } finally {
      setBusy(false);
    }
  };

  const field = (val, setVal, ph) => (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
      <input type={show ? "text" : "password"} value={val} onChange={(e) => setVal(e.target.value)} placeholder={ph}
        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><Lock className="w-4 h-4 text-indigo-500" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Change Password</h3>
                <p className="text-xs text-gray-400 mt-0.5">Confirm your current password to set a new one</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Current Password</label>
              {field(current, setCurrent, "Your current password")}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">New Password</label>
                <button onClick={() => setShow(!show)} className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {show ? "Hide" : "Show"}
                </button>
              </div>
              {field(next, setNext, "At least 6 characters")}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Confirm New Password</label>
              {field(confirm, setConfirm, "Re-enter new password")}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} disabled={busy} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={busy}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Lock className="w-4 h-4" /> Update Password</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Change Email Modal ───────────────────────────────────────────────────────
const ChangeEmailModal = ({ currentEmail, onClose }) => {
  const dispatch = useDispatch();
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { toast.error("Enter a valid email"); return; }
    if (!password) { toast.error("Enter your current password"); return; }
    setBusy(true);
    try {
      const msg = await dispatch(requestEmailChange({ newEmail, password })).unwrap();
      toast.success(msg || "Verification email sent");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to request email change");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><Mail className="w-4 h-4 text-indigo-500" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Change Email</h3>
                <p className="text-xs text-gray-400 mt-0.5">We'll send a confirmation to the new address</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Current Email</label>
              <input value={currentEmail || ""} disabled className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">New Email</label>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" autoFocus
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Current Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Confirm it's you"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} disabled={busy} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button onClick={handleSubmit} disabled={busy}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-60 flex items-center gap-2">
              {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send Verification</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400";

const Field = ({ label, hint, error, children }) => (
  <div className="space-y-1.5">
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

const AccountSettings = () => {
  const dispatch = useDispatch();
  const { user, loading, saving } = useSelector((state) => state.auth);

  const [formData, setFormData]   = useState({ firstName: "", lastName: "", phoneNumber: "" });
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [errors,   setErrors]     = useState({});
  const [isDirty,  setIsDirty]    = useState(false);

  // Fetch user on mount
  useEffect(() => { dispatch(getUserDetails()); }, [dispatch]);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName:   user.firstName   || "",
        lastName:    user.lastName    || "",
        phoneNumber: user.phoneNumber || "",
      });
      setIsDirty(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setIsDirty(true);
    // Clear error on change
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    return newErrors;
  };

  const handleSave = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      toast.success("Profile updated successfully!");
      setIsDirty(false);
      setErrors({});
    } catch (err) {
      toast.error(err || "Failed to update profile.");
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-7 h-7 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ── Profile ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">My Profile</h3>
            <p className="text-xs text-gray-500">Update your personal information.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" error={errors.firstName}>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Jane"
              disabled={saving}
              className={`${inputCls} ${errors.firstName ? "border-red-300 focus:border-red-400 focus:ring-red-500/20" : ""}`}
            />
          </Field>
          <Field label="Last Name">
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              disabled={saving}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Phone Number" hint="Include country code e.g. +1 (555) 000-0000">
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            disabled={saving}
            className={inputCls}
          />
        </Field>

        <div className="flex items-center justify-between pt-2">
          {isDirty && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> You have unsaved changes
            </p>
          )}
          <div className="ml-auto">
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Account Security ── */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Account Security</h3>
            <p className="text-xs text-gray-500">Manage your email and password.</p>
          </div>
        </div>

        {/* Email row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5">{user?.email || "—"}</p>
            </div>
          </div>
          <button onClick={() => setEmailModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
            Change Email
          </button>
        </div>

        {/* Password row */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 tracking-widest">••••••••••••</p>
            </div>
          </div>
          <button onClick={() => setPasswordModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
            Reset Password
          </button>
        </div>
      </div>

      {emailModalOpen && (
        <ChangeEmailModal currentEmail={user?.email} onClose={() => setEmailModalOpen(false)} />
      )}
      {passwordModalOpen && (
        <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </div>
  );
};

export default AccountSettings;
