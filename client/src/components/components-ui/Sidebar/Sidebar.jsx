// src/components/components-ui/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Users, Building2, FileText, Link2, LayoutDashboard,
  PanelLeftClose, PanelLeftOpen, CreditCard, Menu, X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWalletBalance } from "../../../store/slices/assistantsSlice";
import { UserProfile } from "./UserProfile";
import { BottomInfo } from "./BottomInfo";

/* ── Brand logo ── */
const LOGO_URL =
  "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/r4butMmtLNMrYoaq29aF/media/68e2404e47e70ac013e149a0.jpeg";

/* ── Icon map ── */
const ICON_MAP = {
  dashboard:  LayoutDashboard,
  users:      Users,
  building:   Building2,
  document:   FileText,
  link:       Link2,
  creditcard: CreditCard,
};

const MAIN_NAV = [
  { name: "Dashboard",    icon: "dashboard",  link: "/dashboard" },
  { name: "Subaccounts",  icon: "users",      link: "/"          },
  { name: "Agency",       icon: "building",   link: "/agency"    },
  { name: "Rebilling",    icon: "document",   link: "/rebilling" },
  { name: "Integrations", icon: "link",       link: "/integrations" },
];

/* ─────────────────────────────────────────────
   NavItem — single link with accent bar active state
   IMPORTANT: defined at module level, not inside Sidebar render
───────────────────────────────────────────── */
function NavItem({ item, collapsed }) {
  const Icon = ICON_MAP[item.icon] || Link2;

  return (
    <NavLink
      to={item.link}
      title={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg transition-all duration-150 overflow-hidden
         ${collapsed ? "px-0 py-2.5 justify-center" : "px-3 py-2.5"}
         ${isActive
           ? "bg-white/10 text-white"
           : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
         }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Left accent bar */}
          {isActive && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          )}

          {/* Icon */}
          <Icon
            className={`flex-shrink-0 transition-colors duration-150
              ${collapsed ? "w-5 h-5" : "w-4 h-4"}
              ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}
          />

          {/* Label */}
          {!collapsed && (
            <span className="text-sm font-medium leading-none truncate">{item.name}</span>
          )}

          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex items-center z-50">
              <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                {item.name}
              </div>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

/* ─────────────────────────────────────────────
   SectionLabel
   IMPORTANT: defined at module level, not inside Sidebar render
───────────────────────────────────────────── */
function SectionLabel({ label, collapsed }) {
  if (collapsed) {
    return <div className="my-1 border-t border-white/5" />;
  }
  return (
    <div className="px-3 pt-5 pb-1">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-600">
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SidebarContent — extracted to module level to prevent
   infinite remount loop caused by defining it inside Sidebar render
───────────────────────────────────────────── */
function SidebarContent({
  mobile,
  collapsed,
  displayBalance,
  safeUserInfo,
  onCollapse,
  onClose,
}) {
  const isCollapsed = collapsed && !mobile;

  return (
    <div
      className={`flex flex-col h-full bg-[#0a0f1e] relative
        ${mobile ? "w-72" : isCollapsed ? "w-16" : "w-64"}
        transition-all duration-300 ease-in-out`}
    >
      {/* ── Brand Header ── */}
      <div
        className={`flex items-center border-b border-white/5 flex-shrink-0
          ${isCollapsed ? "px-0 py-4 justify-center" : "px-4 py-3.5 gap-3"}`}
      >
        <img
          src={LOGO_URL}
          alt="Yashayah AI"
          className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-lg"
        />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-none tracking-tight">Yashayah AI</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Voice Intelligence</p>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        {!mobile && (
          <button
            onClick={onCollapse}
            className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all duration-150 flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed
              ? <PanelLeftOpen  className="w-4 h-4" />
              : <PanelLeftClose className="w-4 h-4" />
            }
          </button>
        )}
        {/* Mobile close button */}
        {mobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Workspace switcher (UserProfile) ── */}
      <div className={isCollapsed ? "flex justify-center py-3 px-2" : ""}>
        <UserProfile collapsed={isCollapsed} />
      </div>

      {/* ── Navigation ── */}
      <nav
        className={`flex-1 overflow-y-auto sidebar-scroll py-2 space-y-0.5
          ${isCollapsed ? "px-2" : "px-3"}`}
      >
        <SectionLabel label="Workspace" collapsed={isCollapsed} />
        {MAIN_NAV.map((item) => (
          <NavItem key={item.name} item={item} collapsed={isCollapsed} />
        ))}
      </nav>

      {/* ── Footer ── */}
      <BottomInfo
        balance={displayBalance}
        currentUser={safeUserInfo.currentUser}
        collapsed={isCollapsed}
      />

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main UI Sidebar
───────────────────────────────────────────── */
export function Sidebar({ userInfo, navigationItems }) {
  const dispatch = useDispatch();
  const location = useLocation();

  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { walletBalance, fetchingBalance } = useSelector((s) => s.assistants);

  useEffect(() => { dispatch(fetchWalletBalance()); }, [dispatch]);

  /* Close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const safeUserInfo = userInfo || {
    name: "Agency", users: "0", numbers: 0,
    currentUser: { initial: "A", email: "user@agency.com" },
  };

  const displayBalance = fetchingBalance && walletBalance === null
    ? "…"
    : walletBalance !== null
      ? `$${Number(walletBalance).toFixed(2)}`
      : (userInfo?.balance || "$0.00");

  return (
    <>
      {/* ── Mobile hamburger trigger ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 shadow-lg hover:bg-slate-800 transition-all"
        title="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:block h-screen flex-shrink-0">
        <SidebarContent
          mobile={false}
          collapsed={collapsed}
          displayBalance={displayBalance}
          safeUserInfo={safeUserInfo}
          onCollapse={() => setCollapsed((c) => !c)}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <SidebarContent
                mobile
                collapsed={collapsed}
                displayBalance={displayBalance}
                safeUserInfo={safeUserInfo}
                onCollapse={() => setCollapsed((c) => !c)}
                onClose={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
