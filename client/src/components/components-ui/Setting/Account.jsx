// src/components/components-ui/Setting/Account.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails, updateUserProfile } from "../../../store/slices/authSlice";
import { Loader2, User, Lock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

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
          <button className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
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
          <button className="inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all">
            Reset Password
          </button>
        </div>
      </div>

    </div>
  );
};

export default AccountSettings;
