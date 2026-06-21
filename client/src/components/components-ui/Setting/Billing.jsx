// src/components/components-ui/Setting/Billing.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Package } from "lucide-react";
import WalletUsageContent from "./Wallet";
import InvoicesContent from "./Invoices";

const SUBTABS = [
  { id: "walletUsage",   label: "Wallet & Usage"  },
  { id: "invoices",      label: "Invoices"        },
  { id: "subscriptions", label: "Subscriptions"   },
];

const SUBSCRIPTIONS = [
  { name: "Platform Phone Numbers", quantity: 1, price: 2.50, unit: "mo" },
  { name: "Voice Knowledge Base",   quantity: 0, price: 0.00, unit: "mo" },
];

const SubscriptionsContent = () => (
  <div className="space-y-3">
    {SUBSCRIPTIONS.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
          <Package className="w-5 h-5 text-indigo-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No active subscriptions</p>
        <p className="text-xs text-gray-400 mt-1">Subscriptions you purchase will appear here.</p>
      </div>
    ) : (
      SUBSCRIPTIONS.map((sub, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {sub.name} <span className="text-gray-400 font-normal">× {sub.quantity}</span>
              </p>
              {sub.name === "Platform Phone Numbers" && (
                <button className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 mt-0.5 transition-colors">
                  <Download className="w-3 h-3" /> Download as CSV
                </button>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            ${sub.price.toFixed(2)}<span className="text-gray-400 font-normal text-xs"> /{sub.unit}</span>
          </span>
        </div>
      ))
    )}
  </div>
);

const BillingSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState("walletUsage");

  return (
    <div className="space-y-5">
      {/* Sub-tab strip */}
      <div className="flex gap-1 border-b border-gray-100 pb-0">
        {SUBTABS.map(({ id, label }) => {
          const isActive = activeSubTab === id;
          return (
            <motion.button
              key={id}
              onClick={() => setActiveSubTab(id)}
              whileHover={{ y: -1 }}
              transition={{ duration: 0.12 }}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150
                ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
            >
              {label}
              {isActive && (
                <motion.span
                  layoutId="billingSubTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          {activeSubTab === "walletUsage"   && <WalletUsageContent />}
          {activeSubTab === "invoices"      && <InvoicesContent />}
          {activeSubTab === "subscriptions" && <SubscriptionsContent />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BillingSettings;
