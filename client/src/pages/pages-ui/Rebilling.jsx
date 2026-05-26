// src/pages/pages-ui/Rebilling.jsx
import React from "react";
import { TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

import AgencyHeader from "../../components/components-ui/Rebilling/RebillingHeader";
import ReBilling    from "../../components/components-ui/Rebilling/ReBilling";

/* ── Animated stat card ── */
const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    whileHover={{ y: -3, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.10)" }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 cursor-default"
  >
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-400 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </motion.div>
);

const Rebilling = () => {
  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 space-y-8">

        {/* ── Page header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">Re-billing</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track revenue, manage pricing, and configure sub-account billing.
          </p>
        </motion.div>

        {/* ── Connected account header ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <AgencyHeader />
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard
            label="Gross volume (Today)"
            value="$0.00"
            sub={now}
            icon={TrendingUp}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatCard
            label="Gross volume (Trailing 30 days)"
            value="$0.00"
            icon={Clock}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
        </div>

        {/* ── Re-billing revenue section ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm"
        >
          <ReBilling />
        </motion.div>

      </div>
    </div>
  );
};

export default Rebilling;
