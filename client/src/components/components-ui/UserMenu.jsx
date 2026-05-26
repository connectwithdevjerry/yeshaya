// src/components/components-ui/UserMenu.jsx
import React, { useState } from "react";
import { User, LogOut, Wifi, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { motion } from "framer-motion";

const MenuItem = ({ icon: Icon, label, sublabel, onClick, disabled, danger }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 text-left group
      ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      ${danger
        ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
        : "text-slate-300 hover:bg-white/6 hover:text-white"
      }`}
  >
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors
      ${danger ? "bg-red-500/10" : "bg-white/5 group-hover:bg-white/10"}`}
    >
      <Icon className={`w-3.5 h-3.5 ${danger ? "text-red-400" : "text-slate-400 group-hover:text-slate-200"}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium leading-none">{label}</p>
      {sublabel && <p className="text-[10px] text-slate-600 mt-0.5">{sublabel}</p>}
    </div>
    {!danger && !disabled && (
      <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
    )}
  </motion.button>
);

const UserMenuPopup = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const userName    = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User";

  return (
    <div className="w-64 bg-[#131929] border border-white/8 rounded-2xl shadow-2xl overflow-hidden">

      {/* User info header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
              {userInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#131929] rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white text-sm truncate">{userName || "Current user"}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">All services active</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-2 border-b border-white/5">
        <MenuItem
          icon={User}
          label="Your Account"
          sublabel="Manage profile & preferences"
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* Version */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Version</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">3.0.0 · 2025</span>
      </div>

      {/* Logout */}
      <div className="px-2 py-2">
        <MenuItem
          icon={LogOut}
          label={loggingOut ? "Signing out…" : "Sign out"}
          onClick={handleLogout}
          disabled={loggingOut}
          danger
        />
      </div>
    </div>
  );
};

export default UserMenuPopup;
