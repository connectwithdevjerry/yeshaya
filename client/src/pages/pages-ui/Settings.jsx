// src/pages/pages-ui/Settings.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { User, Building2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AccountSettings   from "../../components/components-ui/Setting/Account.jsx";
import WorkspaceSettings from "../../components/components-ui/Setting/WorkSpace.jsx";
import BillingSettings   from "../../components/components-ui/Setting/Billing.jsx";

const TABS = [
  { id: "account",   label: "Account",   icon: User      },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "billing",   label: "Billing",   icon: CreditCard },
];

const Settings = () => {
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const tabParam = params.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "account");

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  const content = {
    account:   <AccountSettings />,
    workspace: <WorkspaceSettings />,
    billing:   <BillingSettings />,
  }[activeTab] ?? <AccountSettings />;

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account, workspace preferences, and billing.
          </p>
        </motion.div>

        {/* ── Card with tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.12 }}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150
                    ${isActive
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}

                  {isActive && (
                    <motion.span
                      layoutId="settingsTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default Settings;
