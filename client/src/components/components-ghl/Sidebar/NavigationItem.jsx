import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  HelpCircle,
  ChevronDown, // Import the dropdown arrow icon
} from "lucide-react";

const iconMap = {
  inbox: Inbox,
  "call-center": PhoneCall,
  contacts: Users,
  knowledge: Book,
  assistants: Bot,
  "active-tags": Tag,
  numbers: Smartphone,
  widgets: Grid,
  settings: Settings,
  help: HelpCircle,
};

export function NavigationItem({ name, icon, link, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const Icon = iconMap[icon] || HelpCircle; // fallback

  if (!iconMap[icon]) {
    console.warn(`⚠️ Unknown icon: "${icon}"`);
  }

  // Check if any child link is the currently active route
  const isChildActive =
    children && children.some((child) => location.pathname === child.link);

  // If a child is active, keep the dropdown open by default
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  // Case 1: This item IS a dropdown (it has children)
  if (children && children.length > 0) {
    return (
      <div>
        {/* The main dropdown button */}{" "}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
            isChildActive
              ? "text-blue-600 bg-blue-50" // Active style if a child is active
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{name}</span>{" "}
          </div>
          {/* Arrow icon that rotates */}

          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {/* The dropdown sub-menu */}
        {isOpen && (
          <div className="pl-8 pt-1 space-y-1">
            
            {children.map((child) => (
              <NavLink
                key={child.name}
                to={child.link}
                className={({ isActive }) =>
                  `flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                    isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900" 
                  }`
                }
              >
                <span className="font-medium">{child.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Case 2: This item is a simple link (no children)
  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
          isActive
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{name}</span>
    </NavLink>
  );
}
