import React, { useState, useEffect } from "react";
import { Settings, HelpCircle, ChevronLeft, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import UserMenuPopup from "../UserMenu";
import { useCurrentAccount } from "../../../hooks/useCurrentAccount";
import { getUserDetails } from "../../../store/slices/authSlice"; // Adjust path as needed

export function BottomInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const account = useCurrentAccount();
  const dispatch = useDispatch();

  // ✅ Connect to Auth State
  const { user, loading } = useSelector((state) => state.auth);

  // ✅ Fetch user details on mount if not already present
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  // Handle Initials logic
  const getInitial = () => {
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <div className="p-4 border-t border-gray-200 space-y-3">
      {/* Account Connected Indicator */}
      {account && (
        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">
              Account Connected
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1 truncate">
            {decodeURIComponent(account.myname || "Account")}
          </p>
        </div>
      )}

      {/* User Menu Trigger */}
      <div className="relative">
        <div
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 cursor-pointer rounded-lg hover:bg-gray-200 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shrink-0">
            {loading && !user ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              getInitial()
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-gray-900 truncate">
              {user?.firstName 
                ? `${user.firstName} ${user.lastName}` 
                : loading ? "Loading..." : "User Account"}
            </div>
            <div className="text-[10px] text-gray-500 truncate">
              {user?.email || "No email found"}
            </div>
          </div>
          
          <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </div>

        {/* User Menu Popup */}
        {isOpen && (
          <>

            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <div className="absolute bottom-full left-0 mb-2 z-50 w-56">
              <UserMenuPopup />
            </div>
          </>
        )}
      </div>
    </div>
  );
}