import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useState } from "react";
import {
  Search, Link2, Bell, CheckCheck, Trash2, X,
  Phone, CreditCard, AlertTriangle, UserPlus,
  BookOpen, Bot, RefreshCw, CornerDownLeft,
  Users, CalendarClock, PhoneCall, Smartphone, Layers, Tag, HelpCircle, Settings,
} from "lucide-react";
import OauthConnectionPopup from "./OauthConnection";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../store/slices/notificationSlice";
import { getIntegrationStatus } from "../../store/slices/integrationSlice";
import { formatDistanceToNow } from "date-fns";

const DESTINATIONS = [
  { label: "Assistants",      route: "/assistants",  icon: Bot,          keywords: "bot ai agent" },
  { label: "Contacts",        route: "/contacts",    icon: Users,        keywords: "people crm leads" },
  { label: "Appointments",    route: "/appointments",icon: CalendarClock,keywords: "calendar booking schedule" },
  { label: "Call Center",     route: "/call",        icon: PhoneCall,    keywords: "calls logs analytics" },
  { label: "Knowledge Bases", route: "/knowledge",   icon: BookOpen,     keywords: "kb docs files faq" },
  { label: "Numbers",         route: "/numbers",     icon: Smartphone,   keywords: "phone twilio sip" },
  { label: "Number Pools",    route: "/pools",       icon: Layers,       keywords: "rotation" },
  { label: "Active Tags",     route: "/activetags",  icon: Tag,          keywords: "tag segment" },
  { label: "Help Center",     route: "/helps",       icon: HelpCircle,   keywords: "support docs guide" },
  { label: "Settings",        route: "/ghl_settings",icon: Settings,     keywords: "account profile" },
];

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
  const [isOpen, setIsOpen]           = useState(false);
  const [activePopup, setActivePopup] = useState();
  const [query, setQuery]             = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const [activeIdx, setActiveIdx]     = useState(0);
  const panelRef  = useRef(null);
  const searchRef = useRef(null);
  const dispatch  = useDispatch();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const location       = useLocation();

  const { items: notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );
  const { goHighLevel, openAI, stripe } = useSelector((s) => s.integrations || {});

  useEffect(() => { dispatch(getIntegrationStatus()); }, [dispatch]);

  // Integration status rows
  const ghlExpired = goHighLevel?.expiryDate && new Date(goHighLevel.expiryDate) < new Date();
  const statusItems = [
    { name: "GoHighLevel", connected: !!goHighLevel?.connected && !ghlExpired, detail: ghlExpired ? "Token expired — reconnect" : "OAuth connection" },
    { name: "OpenAI",      connected: !!openAI?.connected, detail: openAI?.connected ? "API key valid" : (openAI?.message || "Not connected") },
    { name: "Stripe",      connected: !!stripe?.connected, detail: stripe?.presence ? "Account connected" : "Not connected" },
  ];
  const downCount = statusItems.filter((i) => !i.connected).length;

  // Search
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q) || (d.keywords || "").includes(q)).slice(0, 7);
  }, [query]);
  useEffect(() => { setActiveIdx(0); }, [query]);
  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const go = (route) => {
    setQuery(""); setSearchOpen(false);
    if (location.pathname === "/app") {
      const p = new URLSearchParams({
        agencyid:   searchParams.get("agencyid")   || "",
        subaccount: searchParams.get("subaccount") || "",
        allow:      searchParams.get("allow")      || "",
        myname:     searchParams.get("myname")     || "",
        myemail:    searchParams.get("myemail")    || "",
        route,
      });
      navigate(`/app?${p.toString()}`);
    } else { navigate(route); }
  };
  const onSearchKey = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[activeIdx].route); }
    else if (e.key === "Escape") { setSearchOpen(false); }
  };

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
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onSearchKey}
              placeholder="Search pages…"
              className="pl-10 pr-9 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-72 placeholder:text-gray-400"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <AnimatePresence>
              {searchOpen && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 z-50 overflow-hidden"
                >
                  <div className="px-3 pt-2.5 pb-1.5"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pages</span></div>
                  {results.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-gray-400">No matches for "<span className="text-gray-600 font-medium">{query}</span>"</p>
                  ) : (
                    <div className="px-1.5 pb-2 space-y-0.5">
                      {results.map((r, i) => {
                        const RIcon = r.icon; const active = i === activeIdx;
                        return (
                          <button key={r.route} onMouseEnter={() => setActiveIdx(i)} onClick={() => go(r.route)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-indigo-100" : "bg-gray-100"}`}>
                              <RIcon className={`w-3.5 h-3.5 ${active ? "text-indigo-600" : "text-gray-500"}`} />
                            </div>
                            <span className="flex-1 text-left font-medium">{r.label}</span>
                            {active && <CornerDownLeft className="w-3 h-3 text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-100 rounded">↑</kbd><kbd className="px-1 bg-gray-100 rounded">↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-100 rounded">↵</kbd> open</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Link popup — agency shell only (hidden on the GHL sub-account workspace) */}
          {location.pathname !== "/app" && (
            <button
              className={`p-2.5 rounded-xl transition-all relative ${downCount ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"}`}
              onClick={() => togglePopup("oauth")}
              title="Integration connections"
            >
              <Link2 className="w-5 h-5" />
              {downCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full">{downCount}</span>
              )}
            </button>
          )}

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
          <>
            <div className="fixed inset-0 z-40" onClick={() => setActivePopup(null)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-16 top-full mt-2 z-50"
            >
              <OauthConnectionPopup
                items={statusItems}
                onRefresh={() => dispatch(getIntegrationStatus())}
                onClose={() => setActivePopup(null)}
              />
            </motion.div>
          </>
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
