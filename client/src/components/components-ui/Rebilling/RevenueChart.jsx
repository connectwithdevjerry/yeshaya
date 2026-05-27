// src/components/components-ui/Rebilling/RevenueChart.jsx
import React, { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Dot,
} from "recharts";

const RANGES = ["7d", "30d", "90d"];

/* Generate synthetic revenue data for a given number of days */
function generateData(days) {
  return Array.from({ length: days }, (_, i) => {
    const base  = 8 + Math.sin(i / (days / 7.5)) * 4 + (i / days) * 6;
    const value = Math.max(2, base + (Math.random() - 0.5) * 2);
    const label = i === days - 1
      ? "Today"
      : i % Math.ceil(days / 6) === 0
        ? `-${days - 1 - i}d`
        : "";
    return { day: i, label, value: parseFloat(value.toFixed(2)) };
  });
}

/* Custom tooltip */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs text-gray-500">{payload[0]?.payload?.label || `Day ${payload[0]?.payload?.day + 1}`}</p>
      <p className="text-sm font-bold text-gray-900 tabular-nums">
        ${payload[0]?.value?.toFixed(2)}
      </p>
    </div>
  );
};

/* Custom end dot rendered on last data point */
const EndDot = (props) => {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1) return null;
  return (
    <circle cx={cx} cy={cy} r={4} fill="#fff" stroke="#10b981" strokeWidth={2.5} />
  );
};

const RevenueChart = () => {
  const [range, setRange] = useState("30d");

  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  // useMemo so data only regenerates when range changes (not on every render)
  const data = useMemo(() => generateData(days), [range]); // eslint-disable-line

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Revenue</h3>
          <p className="text-xs text-gray-500 mt-0.5">Net rebilled revenue over the last {days} days</p>
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

      {/* Chart */}
      <div className="p-5">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="rebillArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
              strokeDasharray=""
            />

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
              dot={(props) => <EndDot {...props} dataLength={data.length} />}
              activeDot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
