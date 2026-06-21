// src/components/components-ghl/Sidebar/NavigationItem.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  Inbox, PhoneCall, Users, Bot, BookOpen, Tag, Smartphone,
  LayoutGrid, Settings, HelpCircle, ChevronDown, Dot, Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP = {
  inbox:        Inbox,
  "call-center": PhoneCall,
  contacts:     Users,
  knowledge:    BookOpen,
  assistants:   Bot,
  appointments: Calendar,
  "active-tags": Tag,
  numbers:      Smartphone,
  widgets:      LayoutGrid,
  settings:     Settings,
  help:         HelpCircle,
};

export function NavigationItem({ name, icon, link, children, collapsed = false }) {
  const [isOpen,     setIsOpen]     = useState(false);
  const location     = useLocation();
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();

  const Icon = ICON_MAP[icon] || HelpCircle;

  /* ── Active detection ── */
  const isActiveRoute = () => {
    if (location.pathname === "/app") {
      const r = searchParams.get("route");
      return r === link;
    }
    return location.pathname === link;
  };

  const isChildActive = children?.some((c) =>
    location.pathname === "/app"
      ? searchParams.get("route") === c.link
      : location.pathname === c.link
  );

  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  /* ── Navigation handler ── */
  const handleNav = (target) => {
    if (location.pathname === "/app") {
      const p = new URLSearchParams({
        agencyid:   searchParams.get("agencyid")   || "",
        subaccount: searchParams.get("subaccount") || "",
        allow:      searchParams.get("allow")      || "",
        myname:     searchParams.get("myname")     || "",
        myemail:    searchParams.get("myemail")    || "",
        route:      target,
      });
      navigate(`/app?${p.toString()}`);
    } else {
      navigate(target);
    }
  };

  /* ──────────────────────────────────────────
     COLLAPSED — icon only + tooltip
  ────────────────────────────────────────── */
  if (collapsed) {
    const active = children ? isChildActive : isActiveRoute();
    return (
      <div className="relative group">
        <button
          onClick={() => children ? setIsOpen(!isOpen) : handleNav(link)}
          className={`relative flex items-center justify-center w-full py-2.5 rounded-lg transition-all duration-150 overflow-hidden
            ${active ? "bg-white/10 text-white" : "text-slate-500 hover:bg-white/5 hover:text-slate-300"}`}
        >
          {active && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          )}
          <Icon className={`w-5 h-5 transition-colors ${active ? "text-indigo-400" : ""}`} />
        </button>

        {/* Tooltip */}
        <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50">
          <div className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {name}
          </div>
        </div>
      </div>
    );
  }

  /* ──────────────────────────────────────────
     EXPANDED — dropdown parent
  ────────────────────────────────────────── */
  if (children?.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden
            ${isChildActive
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`}
        >
          {isChildActive && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          )}
          <div className="flex items-center gap-3">
            <Icon className={`w-4 h-4 flex-shrink-0 transition-colors
              ${isChildActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
            <span className="text-sm font-medium leading-none">{name}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="ml-7 pl-3 border-l border-white/5 mt-1 mb-1 space-y-0.5">
                {children.map((child) => {
                  const childActive = location.pathname === "/app"
                    ? searchParams.get("route") === child.link
                    : location.pathname === child.link;

                  return (
                    <button
                      key={child.name}
                      onClick={() => handleNav(child.link)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150
                        ${childActive
                          ? "text-indigo-300 bg-indigo-500/10"
                          : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                        }`}
                    >
                      <Dot className={`w-3 h-3 flex-shrink-0 ${childActive ? "text-indigo-400" : "text-slate-700"}`} />
                      {child.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ──────────────────────────────────────────
     EXPANDED — simple link
  ────────────────────────────────────────── */
  const active = isActiveRoute();
  return (
    <button
      onClick={() => handleNav(link)}
      className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden
        ${active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
        }`}
    >
      {active && (
        <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
      )}
      <Icon
        className={`w-4 h-4 flex-shrink-0 transition-colors
          ${active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`}
      />
      <span className="text-sm font-medium leading-none">{name}</span>
    </button>
  );
}
