import React, { useMemo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PhoneCall, Mic, Loader2, AlertCircle } from "lucide-react";
import { getAssistantCallLogs } from "../../../store/slices/assistantsSlice";

const ChartCard = ({ title, value, unit, color, dataKey, data }) => (
  <div className="bg-white border rounded-lg p-6 shadow-sm mb-4">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "15" }}
        >
          {dataKey === "calls" ? (
            <PhoneCall className="w-5 h-5" style={{ color }} />
          ) : (
            <Mic className="w-5 h-5" style={{ color }} />
          )}
        </div>
        <div>
          <h2 className="text-gray-700 font-bold text-lg leading-tight">{title}</h2>
          <p className="text-sm text-gray-500 font-medium">
            {value} {unit}
          </p>
        </div>
      </div>
      <div className="px-2 py-1 bg-gray-50 rounded text-gray-400 text-[10px] font-bold uppercase tracking-wider">
        Live Metrics
      </div>
    </div>

    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            stroke="#94a3b8" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            formatter={(val, name) => [
              name === "minutes" ? `${val.toFixed(2)} mins` : val,
              name === "minutes" ? "Total Time" : "Total Calls"
            ]}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const CallCharts = () => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFreshLogs = async () => {
      setLoading(true);
      try {
        const result = await dispatch(getAssistantCallLogs()).unwrap();
        setLogs(result || []);
      } catch (err) {
        setError(err || "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchFreshLogs();
  }, [dispatch]);

  const chartData = useMemo(() => {
    if (!logs || !Array.isArray(logs) || logs.length === 0) return [];

    const grouped = logs.reduce((acc, call) => {
      // --- THE FIX: Guard against null or invalid dates ---
      if (!call.startedAt) return acc;
      
      const dateObj = new Date(call.startedAt);
      
      // If the date is invalid (NaN), skip this entry to prevent RangeError
      if (isNaN(dateObj.getTime())) return acc;

      // Now it's safe to call toISOString()
      const dateKey = dateObj.toISOString().split('T')[0]; 

      // Extract vapi minutes safely
      const vapiUsage = call.costs?.find((c) => c.type === "vapi");
      const callMinutes = vapiUsage ? vapiUsage.minutes : 0;

      if (!acc[dateKey]) {
        acc[dateKey] = { 
          dateKey, 
          displayDate: dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit' }), 
          calls: 0, 
          minutes: 0 
        };
      }
      
      acc[dateKey].calls += 1;
      acc[dateKey].minutes += callMinutes;
      
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [logs]);

  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => ({
        calls: acc.calls + curr.calls,
        minutes: acc.minutes + curr.minutes,
      }),
      { calls: 0, minutes: 0 }
    );
  }, [chartData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="text-gray-500 font-medium">Analyzing call data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-100 rounded-lg text-red-600">
        <AlertCircle className="w-5 h-5" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Total Call Volume"
        value={totals.calls.toLocaleString()}
        unit="calls"
        color="#6366F1"
        dataKey="calls"
        data={chartData}
      />
      <ChartCard
        title="Total Minutes Used"
        value={totals.minutes.toFixed(2)}
        unit="mins"
        color="#10B981"
        dataKey="minutes"
        data={chartData}
      />
    </div>
  );
};

export default CallCharts;