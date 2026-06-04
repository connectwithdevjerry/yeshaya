// src/components/components-ghl/CallCenter/CallsChart.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { PhoneCall, Mic, Loader2, AlertCircle } from "lucide-react";
import { getAssistantCallLogs } from "../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2.5 rounded-xl shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-gray-300">
        {unit === "calls"
          ? `${payload[0].value} calls`
          : `${payload[0].value?.toFixed(2)} mins`}
      </p>
    </div>
  );
};

/* ── Individual area chart card ── */
const ChartCard = ({ title, value, unit, color, gradientId, dataKey, data }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl border border-gray-100 p-5"
  >
    {/* Card header */}
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          {dataKey === "calls"
            ? <PhoneCall className="w-4 h-4" style={{ color }} />
            : <Mic       className="w-4 h-4" style={{ color }} />
          }
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800 leading-tight">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 tabular-nums">
            <span className="font-semibold" style={{ color }}>{value}</span>
            {" "}{unit}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 bg-gray-50 px-2 py-1 rounded-lg">
        Live
      </span>
    </div>

    {/* Area chart */}
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="displayDate"
            stroke="#cbd5e1"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#cbd5e1"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            allowDecimals={dataKey !== "calls"}
          />
          <Tooltip
            content={(props) => <CustomTooltip {...props} unit={unit} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: 3.5, fill: color, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 5.5, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const CallCharts = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await dispatch(getAssistantCallLogs(subaccountId)).unwrap();
        setLogs(result || []);
      } catch (err) {
        setError(err || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, subaccountId]);

  const chartData = useMemo(() => {
    if (!Array.isArray(logs) || !logs.length) return [];
    const grouped = logs.reduce((acc, call) => {
      if (!call.startedAt) return acc;
      const d = new Date(call.startedAt);
      if (isNaN(d.getTime())) return acc;
      const dateKey = d.toISOString().split("T")[0];
      const vapiMinutes = call.costs?.find((c) => c.type === "vapi")?.minutes || 0;
      if (!acc[dateKey]) {
        acc[dateKey] = {
          dateKey,
          displayDate: d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" }),
          calls: 0,
          minutes: 0,
        };
      }
      acc[dateKey].calls   += 1;
      acc[dateKey].minutes += vapiMinutes;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [logs]);

  const totals = useMemo(() =>
    chartData.reduce((acc, d) => ({ calls: acc.calls + d.calls, minutes: acc.minutes + d.minutes }), { calls: 0, minutes: 0 }),
    [chartData]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
        <p className="text-sm text-gray-400">Analyzing call data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
        <PhoneCall className="w-10 h-10 text-gray-200 mb-3" />
        <p className="text-sm text-gray-400">No chart data available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard
        title="Call Volume"
        value={totals.calls.toLocaleString()}
        unit="calls"
        color="#6366f1"
        gradientId="grad-calls"
        dataKey="calls"
        data={chartData}
      />
      <ChartCard
        title="Minutes Used"
        value={totals.minutes.toFixed(2)}
        unit="mins"
        color="#10b981"
        gradientId="grad-minutes"
        dataKey="minutes"
        data={chartData}
      />
    </div>
  );
};

export default CallCharts;
