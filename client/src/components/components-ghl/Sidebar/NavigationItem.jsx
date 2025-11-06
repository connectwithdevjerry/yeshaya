// src/components/components-ghl/Sidebar/NavigationItem.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  ChevronDown,
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const Icon = iconMap[icon] || HelpCircle;

  if (!iconMap[icon]) {
    console.warn(`⚠️ Unknown icon: "${icon}"`);
  }

  // ✅ Check if current route matches (for /app format)
  const isActiveRoute = () => {
    if (location.pathname === '/app') {
      const currentRoute = searchParams.get('route');
      return currentRoute === link;
    }
    return location.pathname === link;
  };

  // Check if any child link is the currently active route
  const isChildActive = children && children.some((child) => {
    if (location.pathname === '/app') {
      const currentRoute = searchParams.get('route');
      return currentRoute === child.link;
    }
    return location.pathname === child.link;
  });

  // If a child is active, keep the dropdown open by default
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  // ✅ Handle navigation with account context
  const handleNavigation = (targetRoute) => {
    // If we're on /app (account context), navigate with params
    if (location.pathname === '/app') {
      const agencyid = searchParams.get('agencyid');
      const subaccount = searchParams.get('subaccount');
      const allow = searchParams.get('allow');
      const myname = searchParams.get('myname');
      const myemail = searchParams.get('myemail');

      if (agencyid && subaccount) {
        const params = new URLSearchParams({
          agencyid,
          subaccount,
          allow,
          myname,
          myemail,
          route: targetRoute,
        });
        navigate(`/app?${params.toString()}`);
        return;
      }
    }
    
    // Otherwise, navigate normally
    navigate(targetRoute);
  };

  // Case 1: This item IS a dropdown (it has children)
  if (children && children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors duration-200 ${
            isChildActive
              ? "text-blue-600 bg-blue-50"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{name}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="pl-8 pt-1 space-y-1">
            {children.map((child) => {
              const isChildActiveNow = location.pathname === '/app' 
                ? searchParams.get('route') === child.link
                : location.pathname === child.link;

              return (
                <button
                  key={child.name}
                  onClick={() => handleNavigation(child.link)}
                  className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${
                    isChildActiveNow
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="font-medium">{child.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Case 2: This item is a simple link (no children)
  return (
    <button
      onClick={() => handleNavigation(link)}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 w-full ${
        isActiveRoute()
          ? "text-blue-600 bg-blue-50"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{name}</span>
    </button>
  );
}