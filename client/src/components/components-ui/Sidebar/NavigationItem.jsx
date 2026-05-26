// src/components/components-ui/Sidebar/NavigationItem.jsx
// NOTE: Navigation is now rendered directly inside Sidebar.jsx via NavItem.
// This file is kept for backward compatibility but is no longer the primary nav renderer.
import React from "react";
import { NavLink } from "react-router-dom";
import { Users, Building2, FileText, Link2, LayoutDashboard } from "lucide-react";

const iconMap = {
  dashboard: LayoutDashboard,
  users:     Users,
  building:  Building2,
  document:  FileText,
  link:      Link2,
};

export function NavigationItem({ name, icon, link }) {
  const Icon = iconMap[icon] || Link2;

  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 overflow-hidden
         ${isActive
           ? "bg-white/10 text-white"
           : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
         }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-violet-500" />
          )}
          <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
          <span>{name}</span>
        </>
      )}
    </NavLink>
  );
}
