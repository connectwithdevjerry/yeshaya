import React, { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import {
  Search, Link2, Bell, CheckCheck, Trash2, X,
  Phone, CreditCard, AlertTriangle, UserPlus,
  BookOpen, Bot, RefreshCw
} from "lucide-react";
import OauthConnectionPopup from "./OauthConnection";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import { formatDistanceToNow } from "date-fns";

// ─── Icon & colour per notification type ──────────────────────────────────────
const TYPE_CONFIG = {
  call_completed:       { icon: Phone,         bg: "bg-blue-100",   text: "text-blue-600",   label: "Call" },
  payment_received:     { icon: CreditCard,     bg: "bg-green-100",  text: "text-green-600",  label: "Payment" },
  low_balance:          { icon: AlertTriangle,  bg: "bg-amber-100",  text: "text-amber-600",  label: "Balance" },
  new_contact:          { icon: UserPlus,       bg: "bg-purple-100", text: "text-purple-600", label: "Contact" },
  subaccount_imported:  { icon: Bot,            bg: "bg-indigo-100", text: "text-indigo-600", label: "Account" },
  knowledge_base_added: { icon: BookOpen,       bg: "bg-teal-100",   text: "text-teal-600",   label: "Knowledge" },
  assistant_created:    { icon: Bot,            bg: "bg-violet-100", text: "text-violet-600", label: "Assistant" },
  number_purchased:     { icon: Phone,          bg: "bg-cyan-100",   text: "text-cyan-600",   label: "Number" },
  general:              { icon: Bell,           bg: "bg-gray-100",   text: "text-gray-600",   label: "Info" },
};

function NotificationItem({ notification, onRead, onDelete }) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.general;
  const Icon   = config.icon;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  const handleClick = () => {
    if (!notification.read) onRead(notification._id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.18 }}
      onClick={handleClick}
      className={`group flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150 hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
        !notification.read ? "bg-indigo-50/40" : ""
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config.bg}`}>
        <Icon className={`w-4 h-4 ${config.text}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight truncate ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-indigo-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notification._id); }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function Header({ title }) {
  const [isOpen, setIsOpen]         = useState(false);
  const [activePopup, setActivePopup] = useState();
  const panelRef = useRef(null);
  const dispatch = useDispatch();

  const { items: notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  // ── Fetch on mount + poll every 60s ──────────────────────────────────────
  const loadNotifications = useCallback(() => {
    dispatch(fetchNotifications({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(interval);
  }, [dispatch, loadNotifications]);

  // ── Close panel on outside click ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  const togglePopup = (name) => setActivePopup(activePopup === name ? null : name);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) loadNotifications();
  };

  const handleMarkRead    = (id) => dispatch(markNotificationRead(id));
  const handleMarkAll     = ()   => dispatch(markAllNotificationsRead());
  const handleDelete      = (id) => dispatch(deleteNotification(id));
  const handleClearAll    = ()   => dispatch(clearAllNotifications());

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for anything..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>

          {/* Link popup */}
          <button
            className="p-2 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200 relative"
            onClick={() => togglePopup("oauth")}
          >
            <Link2 className="w-5 h-5" />
          </button>

          {/* Bell */}
          <button
            className="relative p-2 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-200"
            onClick={handleOpen}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* OAuth popup */}
      <AnimatePresence>
        {activePopup === "oauth" && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-20 top-full mt-1 z-50"
          >
            <OauthConnectionPopup onClose={() => setActivePopup(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full right-4 mt-1 z-50 w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Refresh */}
                <button
                  onClick={loadNotifications}
                  title="Refresh"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                {/* Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    title="Mark all as read"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {/* Clear all */}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    title="Clear all"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                  <p className="text-sm text-gray-400">Loading notifications…</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-indigo-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">You're all caught up! 🥳</p>
                  <p className="text-xs text-gray-400">No notifications yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
                <span className="text-xs text-gray-400">
                  {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
