// src/components/components-ui/Rebilling/RevenueChart.jsx
import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const RANGES = ["7d", "30d", "90d"];

/* ── Synthetic fallback (used when no real transactions exist yet) ── */
function generateSyntheticData(days) {
  return Array.from({ length: days }, (_, i) => {
    const base  = 8 + Math.sin(i / (days / 7.5)) * 4 + (i / days) * 6;
    const value = Math.max(0, base + (Math.random() - 0.5) * 2);
    return {
      label: i === days - 1 ? "Today" : i % Math.ceil(days / 6) === 0 ? `-${days - 1 - i}d` : "",
      value: parseFloat(value.toFixed(4)),
    };
  });
}

/* ── Aggregate real transactions by day ── */
function aggregateByDay(transactions, days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  // Build a map: "YYYY-MM-DD" → total amount
  const dayMap = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff);
    d.setDate(d.getDate() + i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }

  transactions
    .filter((tx) => tx.type === "end-of-call-report")
    .forEach((tx) => {
      const key = new Date(tx.processedAt).toISOString().slice(0, 10);
      if (key in dayMap) {
        dayMap[key] += tx.amount || 0;
      }
    });

  const keys = Object.keys(dayMap).sort();
  return keys.map((key, i) => ({
    label:
      i === keys.length - 1
        ? "Today"
        : i % Math.ceil(days / 6) === 0
          ? `-${days - 1 - i}d`
          : "",
    value: parseFloat(dayMap[key].toFixed(4)),
  }));
}

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2">
      {label && <p className="text-xs text-gray-500 mb-0.5">{label}</p>}
      <p className="text-sm font-bold text-gray-900 tabular-nums">
        ${payload[0]?.value?.toFixed(4)}
      </p>
    </div>
  );
};

/* ── Skeleton chart placeholder ── */
const ChartSkeleton = () => (
  <div className="h-[220px] flex flex-col justify-end gap-2 px-4 pb-4 animate-pulse">
    <div className="flex items-end gap-1 h-full">
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-100 rounded-t"
          style={{ height: `${20 + Math.sin(i / 5) * 30 + 20}%` }}
        />
      ))}
    </div>
  </div>
);

const RevenueChart = ({ transactions = [], fetchingTransactions = false }) => {
  const [range, setRange] = useState("30d");
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const data = useMemo(() => {
    const callTxs = transactions.filter((tx) => tx.type === "end-of-call-report");
    if (callTxs.length === 0) return generateSyntheticData(days);
    return aggregateByDay(transactions, days);
  }, [transactions, days]);

  const isEmpty = data.every((d) => d.value === 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Revenue</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {fetchingTransactions
              ? "Loading transaction data…"
              : isEmpty
                ? "No call data yet — showing sample chart"
                : `Net rebilled revenue over the last ${days} days`
            }
          </p>
        </div>
        {/* Segmented range control */}
        <div className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 rounded-lg p-0.5 flex-shrink-0">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all duration-150
                ${r === range
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      <div className="p-5">
        {fetchingTransactions ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rebillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#f1f5f9" />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />

              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#rebillArea)"
                strokeLinecap="round"
                strokeLinejoin="round"
                activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
