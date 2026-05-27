// src/pages/pages-ui/Rebilling.jsx
import React from "react";
import { TrendingUp, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

import RebillingHeader        from "../../components/components-ui/Rebilling/RebillingHeader";
import RevenueChart           from "../../components/components-ui/Rebilling/RevenueChart";
import PricingBySubAccountTable from "../../components/components-ui/Rebilling/PricingBySubAccountTable";
import TransactionsTable      from "../../components/components-ui/Rebilling/TransactionsTable";

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, sub, trend, iconBg, iconColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
      {(trend || sub) && (
        <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trend ? "text-emerald-600" : "text-gray-400"}`}>
          {trend && <TrendingUp className="w-3 h-3" />}
          {trend || sub}
        </p>
      )}
    </div>
  </motion.div>
);

/* ── Section fade-up wrapper ── */
const Section = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay }}
  >
    {children}
  </motion.div>
);

const Rebilling = () => {
  const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">

        {/* ── Page header ── */}
        <Section delay={0}>
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Re-billing</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track revenue, manage pricing, and configure sub-account billing.
            </p>
          </div>
        </Section>

        {/* ── Agency / Stripe header card ── */}
        <Section delay={0.07}>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <RebillingHeader />
          </div>
        </Section>

        {/* ── KPI stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <StatCard
            icon={TrendingUp}
            label="Gross volume (Today)"
            value="$184.20"
            sub={now}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            delay={0.14}
          />
          <StatCard
            icon={Clock}
            label="Gross volume (Trailing 30d)"
            value="$4,812.40"
            trend="+ 18.2% vs prior"
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            delay={0.18}
          />
          <StatCard
            icon={DollarSign}
            label="Profit margin (30d)"
            value="48.6%"
            trend="↑ 4.1 pts"
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            delay={0.22}
          />
        </div>

        {/* ── Revenue chart ── */}
        <Section delay={0.28}>
          <RevenueChart />
        </Section>

        {/* ── Pricing by sub-account ── */}
        <Section delay={0.33}>
          <PricingBySubAccountTable />
        </Section>

        {/* ── Recent transactions ── */}
        <Section delay={0.38}>
          <TransactionsTable />
        </Section>

      </div>
    </div>
  );
};

export default Rebilling;
