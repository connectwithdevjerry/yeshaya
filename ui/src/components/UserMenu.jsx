import React, { useState } from "react";
import { User, LogOut, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";

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
    <Icon className="w-5 h-5 mr-3 text-indigo-600" />
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

      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-[300px] bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden text-sm">
      {/* 1. User Info Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 font-bold rounded-full mr-3">
          {user?.firstName?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <div className="font-semibold text-gray-800">
            {user?.firstName
              ? `${user.firstName} ${user.lastName}`
              : "Current user"}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email || "user@example.com"}
          </div>
        </div>
      </div>

      {/* 2. Service Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center text-green-600 font-medium">
          <Wifi className="w-4 h-4 mr-2" />
          All services are active
        </div>
      </div>

      {/* 3. Account Actions */}
      <div className="py-2 border-b border-gray-200">
        <UserMenuItem
          icon={User}
          label="Your Account"
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* 4. App Version Info */}
      <div className="p-3 text-gray-500 border-b border-gray-200">
        <div className="text-xs font-semibold uppercase mb-1">APP VERSION</div>
        <div className="text-sm">3.0.0 (Build 2025.06.27)</div>
      </div>

      {/* 5. Logout */}
      <div className="py-2 border-gray-200">
        <UserMenuItem
          icon={LogOut}
          label={loggingOut ? "Logging out…" : "Log out"}
          onClick={handleLogout}
          disabled={loggingOut}
        />
      </div>
    </div>
  );
};

export default UserMenuPopup;
