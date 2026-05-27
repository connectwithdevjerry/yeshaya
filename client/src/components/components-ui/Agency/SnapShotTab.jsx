// src/components/components-ui/Agency/SnapShotTab.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToggleLeft, DollarSign, Layers, Sliders } from "lucide-react";
import FeaturesTab   from "./SnapShot/FeaturesTab";
import ReBillingTab  from "./SnapShot/ReBillingTab";
import ResourcesTab  from "./SnapShot/Resources";
import LimitsTab     from "./SnapShot/Limits";

const TABS = [
  { id: "features",   label: "Features",    icon: ToggleLeft  },
  { id: "rebilling",  label: "Re-Billing",  icon: DollarSign  },
  { id: "resources",  label: "Resources",   icon: Layers      },
  { id: "limits",     label: "Limits",      icon: Sliders     },
];

export default function SnapshotSettingsPage() {
  const [activeTab, setActiveTab] = useState("features");

  const content = {
    features:  <FeaturesTab />,
    rebilling: <ReBillingTab />,
    resources: <ResourcesTab />,
    limits:    <LimitsTab />,
  }[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">Snapshot for New Accounts</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure default settings applied when a new sub-account is created.
        </p>
      </div>

      {/* ── Inner animated tab strip ── */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 px-2 pt-2 gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <motion.button
                key={id}
                onClick={() => setActiveTab(id)}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.12 }}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150 whitespace-nowrap
                  ${isActive
                    ? "text-indigo-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isActive && (
                  <motion.span
                    layoutId="snapshotInnerTab"
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
            transition={{ duration: 0.18 }}
            className="p-6"
          >
            {content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
