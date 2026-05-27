// src/pages/pages-ui/Rebilling.jsx
import React, { useEffect, useMemo } from "react";
import { TrendingUp, Clock, Wallet, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactionHistory, fetchWalletBalance } from "../../store/slices/assistantsSlice";

import RebillingHeader          from "../../components/components-ui/Rebilling/RebillingHeader";
import RevenueChart             from "../../components/components-ui/Rebilling/RevenueChart";
import PricingBySubAccountTable from "../../components/components-ui/Rebilling/PricingBySubAccountTable";

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, sub, trend, iconBg, iconColor, loading, delay }) => (
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
      {loading ? (
        <div className="flex items-center gap-2 mt-1">
          <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
          <div className="h-6 w-24 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      ) : (
        <p className="text-2xl font-bold text-gray-900 leading-none tabular-nums">{value}</p>
      )}
      {(trend || sub) && !loading && (
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

/* ── Helpers ── */
const startOf = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmt = (n) =>
  n === 0 ? "$0.00" : `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Rebilling = () => {
  const dispatch = useDispatch();
  const { transactions, fetchingTransactions, walletBalance, fetchingBalance } =
    useSelector((s) => s.assistants);

  useEffect(() => {
    dispatch(fetchTransactionHistory());
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  /* ── Derived stats from live transaction data ── */
  const { grossToday, gross30d } = useMemo(() => {
    const callTxs = (transactions || []).filter(
      (tx) => tx.type === "end-of-call-report"
    );
    const todayStart  = startOf(0);
    const thirtyStart = startOf(30);

    const grossToday = callTxs
      .filter((tx) => new Date(tx.processedAt) >= todayStart)
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    const gross30d = callTxs
      .filter((tx) => new Date(tx.processedAt) >= thirtyStart)
      .reduce((s, tx) => s + (tx.amount || 0), 0);

    return { grossToday, gross30d };
  }, [transactions]);

  const now           = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const balanceStr    = walletBalance != null ? `$${Number(walletBalance).toFixed(2)}` : "$0.00";
  const isLoadingData = fetchingTransactions;

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
            value={fmt(grossToday)}
            sub={now}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            loading={isLoadingData}
            delay={0.14}
          />
          <StatCard
            icon={Clock}
            label="Gross volume (Trailing 30d)"
            value={fmt(gross30d)}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            loading={isLoadingData}
            delay={0.18}
          />
          <StatCard
            icon={Wallet}
            label="Wallet balance"
            value={balanceStr}
            sub="Current agency balance"
            iconBg="bg-violet-100"
            iconColor="text-violet-600"
            loading={fetchingBalance && walletBalance === null}
            delay={0.22}
          />
        </div>

        {/* ── Revenue chart (live) ── */}
        <Section delay={0.28}>
          <RevenueChart
            transactions={transactions || []}
            fetchingTransactions={fetchingTransactions}
          />
        </Section>

        {/* ── Pricing by sub-account ── */}
        <Section delay={0.33}>
          <PricingBySubAccountTable />
        </Section>

      </div>
    </div>
  );
};

export default Rebilling;
