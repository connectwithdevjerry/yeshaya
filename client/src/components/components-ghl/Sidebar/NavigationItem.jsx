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
import { motion, AnimatePresence } from "framer-motion";

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

  const isActiveRoute = () => {
    if (location.pathname === '/app') {
      const currentRoute = searchParams.get('route');
      return currentRoute === link;
    }
    return location.pathname === link;
  };

  const isChildActive = children && children.some((child) => {
    if (location.pathname === '/app') {
      const currentRoute = searchParams.get('route');
      return currentRoute === child.link;
    }
    return location.pathname === child.link;
  });

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);

  const handleNavigation = (targetRoute) => {
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
    navigate(targetRoute);
  };

  // Case 1: Dropdown parent (has children)
  if (children && children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-all duration-200 ${
            isChildActive
              ? "text-indigo-400 bg-slate-800"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{name}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pl-5 pt-1 space-y-1 pb-2">
                {children.map((child) => {
                  const isChildActiveNow = location.pathname === '/app'
                    ? searchParams.get('route') === child.link
                    : location.pathname === child.link;

                  return (
                    <button
                      key={child.name}
                      onClick={() => handleNavigation(child.link)}
                      className={`flex items-center w-full rounded-lg px-2 py-1.5 transition-colors duration-200 text-sm ${
                        isChildActiveNow
                          ? "text-indigo-400 font-semibold"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className="font-medium text-xs">{child.name}</span>
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

  // Case 2: Simple link
  const active = isActiveRoute();
  return (
    <motion.button
      onClick={() => handleNavigation(link)}
      whileHover={!active ? { x: 2 } : {}}
      transition={{ duration: 0.15 }}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 w-full ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-medium">{name}</span>
    </motion.button>
  );
}
