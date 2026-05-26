// src/components/components-ghl/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile }  from "./UserProfile";
import { NavigationItem } from "./NavigationItem";
import { BottomInfo }   from "./BottomInfo";

const LOGO_URL =
  "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/r4butMmtLNMrYoaq29aF/media/68e2404e47e70ac013e149a0.jpeg";

export function SidebarGHL({ userInfo, navigationItems }) {
  const location = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname + location.search]);

  const safeUserInfo = userInfo || {
    name: "Agency", users: "0",
    currentUser: { initial: "A", email: "user@agency.com" },
  };

  const safeNavItems = navigationItems || [];

  /* ── Shared inner content ── */
  const SidebarContent = ({ mobile = false }) => {
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
          {(!isCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none tracking-tight">Yashayah AI</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Sub-account</p>
            </div>
          )}
          {/* Collapse toggle */}
          {!mobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all duration-150 flex-shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed
                ? <PanelLeftOpen  className="w-4 h-4" />
                : <PanelLeftClose className="w-4 h-4" />
              }
            </button>
          )}
          {mobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Account profile ── */}
        <div className={isCollapsed ? "flex justify-center py-3 px-2" : ""}>
          <UserProfile
            name={safeUserInfo.name}
            users={safeUserInfo.users}
            collapsed={isCollapsed}
          />
        </div>

        {/* ── Navigation ── */}
        <nav
          className={`flex-1 overflow-y-auto sidebar-scroll py-2 space-y-0.5
            ${isCollapsed ? "px-2" : "px-3"}`}
        >
          {safeNavItems.map((item) => (
            <NavigationItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              link={item.link}
              children={item.children}
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* ── Footer ── */}
        <BottomInfo collapsed={isCollapsed} />

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>
    );
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-300 shadow-lg hover:bg-slate-800 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop */}
      <div className="hidden lg:block h-screen flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
