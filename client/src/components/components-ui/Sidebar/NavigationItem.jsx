import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Building2, FileText, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  users: Users,
  building: Building2,
  document: FileText,
  link: Link2,
};

export function NavigationItem({ name, icon, link }) {
  const Icon = iconMap[icon];

  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <motion.div
          className="flex items-center space-x-3 w-full"
          whileHover={!isActive ? { x: 2 } : {}}
          transition={{ duration: 0.15 }}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{name}</span>
        </motion.div>
      )}
    </NavLink>
  );
}
