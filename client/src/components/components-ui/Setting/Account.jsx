// src/components/components-ui/Setting/Account.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserDetails } from "../../../store/slices/authSlice";
import { Loader2, User, Lock, Mail } from "lucide-react";

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

const AccountSettings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ firstName: "", lastName: "", phone: "" });

  useEffect(() => { dispatch(getUserDetails()); }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName:  user.lastName  || "",
        phone:     user.phone     || "",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.id]: e.target.value }));

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
          <Field label="First Name">
            <input
              type="text" id="firstName" value={formData.firstName}
              onChange={handleChange} placeholder="Jane"
              className={inputCls}
            />
          </Field>
          <Field label="Last Name">
            <input
              type="text" id="lastName" value={formData.lastName}
              onChange={handleChange} placeholder="Doe"
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Phone Number">
          <input
            type="tel" id="phone" value={formData.phone}
            onChange={handleChange} placeholder="+1 (555) 000-0000"
            className={inputCls}
          />
        </Field>

        <div className="flex justify-end pt-2">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all">
            Save Changes
          </button>
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
