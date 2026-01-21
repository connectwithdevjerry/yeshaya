import React, { useState } from "react";
import { User, LogOut, Wifi, Loader2 } from "lucide-react"; // Added Loader2
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";

const UserMenuItem = ({ icon: Icon, label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center p-3 text-gray-700 transition-colors text-left rounded-md
      ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-100 cursor-pointer"
      }`}
  >
    {disabled ? (
      <Loader2 className="w-5 h-5 mr-3 text-indigo-600 animate-spin" />
    ) : (
      <Icon className="w-5 h-5 mr-3 text-indigo-600" />
    )}
    <span className="font-medium">{label}</span>
  </button>
);

const UserMenuPopup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (error) {
      localStorage.removeItem("accessToken"); // Matches your authSlice
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    /* Added: 
       - min-w-[280px] for consistency
       - shadow-2xl for depth
       - ring-1 ring-black/5 for a crisp border
    */
    <div className="w-[300px] bg-white shadow-2xl rounded-xl border border-gray-200 overflow-hidden text-sm ring-1 ring-black/5">
      {/* 1. User Info Header */}
      <div className="flex items-center p-4 bg-gray-50/50 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white font-bold rounded-full mr-3 shadow-sm">
          {user?.firstName?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">
            {user?.firstName ? `${user.firstName} ${user.lastName}` : "User Account"}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {user?.email || "user@example.com"}
          </div>
        </div>
      </div>

      {/* 2. Service Status */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center text-green-600 text-[11px] font-bold uppercase tracking-wider">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          All systems operational
        </div>
      </div>

      {/* 3. Account Actions */}
      <div className="p-2 border-b border-gray-100">
        <UserMenuItem
          icon={User}
          label="Account Settings"
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* 4. App Version Info */}
      <div className="px-4 py-3 bg-gray-50/30 text-gray-400 border-b border-gray-100">
        <div className="text-[10px] font-bold uppercase mb-0.5">Engine Version</div>
        <div className="text-xs font-mono">v3.0.0-build.2026</div>
      </div>

      {/* 5. Logout */}
      <div className="p-2">
        <UserMenuItem
          icon={LogOut}
          label={loggingOut ? "Logging out..." : "Log out"}
          onClick={handleLogout}
          disabled={loggingOut}
        />
      </div>
    </div>
  );
};

export default UserMenuPopup;