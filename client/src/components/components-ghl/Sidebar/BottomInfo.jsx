import React, { useState, useEffect } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import UserMenuPopup from "../UserMenu";
import { useCurrentAccount } from "../../../hooks/useCurrentAccount";
import { getUserDetails } from "../../../store/slices/authSlice";
import { AnimatePresence, motion } from "framer-motion";

export function BottomInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const account = useCurrentAccount();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  const getInitial = () => {
    if (user?.firstName) return user.firstName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  return (
    <div className="p-4 border-t border-slate-800 space-y-3">
      {/* Account Connected Indicator */}
      {account && (
        <div className="px-3 py-2 bg-green-900/20 border border-green-700/40 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">Account Connected</span>
          </div>
          <p className="text-xs text-green-400/70 mt-1 truncate">
            {decodeURIComponent(account.myname || "Account")}
          </p>
        </div>
      )}

      {/* User Menu Trigger */}
      <div className="relative">
        <div
          className="flex items-center space-x-2 px-3 py-2 bg-slate-800 cursor-pointer rounded-lg hover:bg-slate-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded flex items-center justify-center text-white text-xs font-bold shrink-0">
            {loading && !user ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              getInitial()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-white truncate">
              {user?.firstName
                ? `${user.firstName} ${user.lastName}`
                : loading ? "Loading..." : "User Account"}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {user?.email || "No email found"}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 z-50 w-56"
              >
                <UserMenuPopup />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
