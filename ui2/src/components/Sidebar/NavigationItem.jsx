import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Inbox,
  PhoneCall,
  Users,
  Bot,
  Book,
  Tag,
  Smartphone,
  Grid,
  Settings,
  HelpCircle
} from 'lucide-react';

const iconMap = {
  'inbox': Inbox,
  'call-center': PhoneCall,
  'contacts': Users,
  'knowledge': Book,
  'assistants': Bot,
  'active-tags': Tag,
  'numbers': Smartphone,
  'widgets': Grid,
  'settings': Settings,
  'help': HelpCircle,
};

export function NavigationItem({ name, icon, link }) {
  const Icon = iconMap[icon] || HelpCircle; // fallback

  if (!iconMap[icon]) {
    console.warn(`⚠️ Unknown icon: "${icon}"`);
  }

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
