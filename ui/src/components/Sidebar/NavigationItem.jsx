import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Building2, FileText, Link2 } from 'lucide-react';

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
        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{name}</span>
    </NavLink>
  );
}
