// src/components/components-ghl/CallCenter/PieChartDashboard.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Smile, PhoneMissed, Loader2 } from "lucide-react";
import { getAssistantCallLogs } from "../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

const COLORS_SENTIMENT = ["#10b981", "#f59e0b", "#ef4444"];
const COLORS_HANGUP    = ["#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#64748b"];

/* ── Custom tooltip ── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="font-semibold">{payload[0].name}</p>
      <p className="text-gray-300 mt-0.5">{payload[0].value} calls</p>
    </div>
  );
};

/* ── Custom legend ── */
const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
};

/* ── Chart card wrapper ── */
const ChartCard = ({ title, icon: Icon, iconBg, iconColor, children, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 flex-1 min-w-0"
  >
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor}`} size={18} />
      </div>
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    </div>
    {loading ? (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    ) : children}
  </motion.div>
);

const PieChartsDashboard = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await dispatch(getAssistantCallLogs(subaccountId)).unwrap();
        setLogs(result);
      } catch (e) {
        console.error("Pie chart data error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, subaccountId]);

  const sentimentData = useMemo(() => {
    if (!logs.length) return [];
    const counts = logs.reduce((acc, call) => {
      const label = call.analysis?.successEvaluation === "true" ? "Positive" : "Negative";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "Positive", value: counts.Positive || 0 },
      { name: "Neutral",  value: 0 },
      { name: "Negative", value: counts.Negative || 0 },
    ].filter((d) => d.value > 0 || d.name === "Positive");
  }, [logs]);

  const hangupData = useMemo(() => {
    if (!logs.length) return [];
    const reasons = logs.reduce((acc, call) => {
      const r = (call.endedReason || "unknown").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(reasons).map(([name, value]) => ({ name, value }));
  }, [logs]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Success Evaluation */}
      <ChartCard
        title="Success Evaluation"
        icon={Smile}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        loading={loading}
      >
        {sentimentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sentimentData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {sentimentData.map((_, i) => (
                  <Cell key={i} fill={COLORS_SENTIMENT[i % COLORS_SENTIMENT.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            No evaluation data yet
          </div>
        )}
      </ChartCard>

      {/* Hangup Reasons */}
      <ChartCard
        title="Hangup Reasons"
        icon={PhoneMissed}
        iconBg="bg-rose-50"
        iconColor="text-rose-500"
        loading={loading}
      >
        {hangupData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={hangupData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                strokeWidth={0}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {hangupData.map((_, i) => (
                  <Cell key={i} fill={COLORS_HANGUP[i % COLORS_HANGUP.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            No hangup data yet
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default PieChartsDashboard;
