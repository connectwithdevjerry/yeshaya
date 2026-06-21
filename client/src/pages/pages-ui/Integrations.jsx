// src/pages/pages-ui/Integrations.jsx
import React, { useState } from "react";
import { Plug, Key, Webhook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import IntegrationsContent from "../../components/components-ui/Integration/Integrations.jsx";
import APIKeysContent     from "../../components/components-ui/Integration/Api.jsx";
import WebhooksContent    from "../../components/components-ui/Integration/Webhooks.jsx";

const TABS = [
  { id: "integrations", label: "Integrations", icon: Plug    },
  { id: "apiKeys",      label: "API Keys",      icon: Key     },
  { id: "webhooks",     label: "Webhooks",      icon: Webhook },
];

const Integrations = () => {
  const [activeTab, setActiveTab] = useState("integrations");

  const content = {
    integrations: <IntegrationsContent />,
    apiKeys:      <APIKeysContent />,
    webhooks:     <WebhooksContent />,
  }[activeTab];

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
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your tools, manage API keys, and configure webhooks.
          </p>
        </motion.div>

        {/* ── Tab bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.07 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1 relative">
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

                  {/* Animated underline */}
                  {isActive && (
                    <motion.span
                      layoutId="integrationsTabUnderline"
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
              className="p-6"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default Integrations;
