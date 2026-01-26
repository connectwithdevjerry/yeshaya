import React, { useMemo, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Smile, PhoneMissed, Loader2 } from "lucide-react";
// Import your thunk
import { getAssistantCallLogs } from "../../../store/slices/assistantsSlice";

const COLORS_SENTIMENT = ["#2dd4bf", "#fbbf24", "#f87171"]; // Positive (Teal), Neutral (Amber), Negative (Red)
const COLORS_HANGUP = ["#ef4444", "#f97316", "#8b5cf6", "#6366f1", "#94a3b8"];

const PieChartsDashboard = () => {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const result = await dispatch(getAssistantCallLogs()).unwrap();
        setLogs(result);
      } catch (error) {
        console.error("Error loading pie chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [dispatch]);

  // 1. Process Sentiment Data (Success vs Failure)
  const sentimentData = useMemo(() => {
    if (!logs.length) return [];
    const counts = logs.reduce((acc, call) => {
      // Map 'true'/'false' success evaluation to labels
      const isSuccess = call.analysis?.successEvaluation === "true";
      const label = isSuccess ? "Positive" : "Negative";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Positive", value: counts["Positive"] || 0 },
      { name: "Neutral", value: 0 }, // Placeholder if you don't have neutral logic yet
      { name: "Negative", value: counts["Negative"] || 0 },
    ];
  }, [logs]);

  // 2. Process Hangup Reasons
  const hangupData = useMemo(() => {
    if (!logs.length) return [];
    const reasons = logs.reduce((acc, call) => {
      const reason = call.endedReason || "unknown";
      // Format: "customer-ended-call" -> "Customer Ended Call"
      const formattedReason = reason.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      acc[formattedReason] = (acc[formattedReason] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(reasons).map(([name, value]) => ({ name, value }));
  }, [logs]);

  if (loading) return (
    <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg border border-dashed">
      <Loader2 className="animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sentiment Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-cyan-500 text-white rounded-lg w-8 h-8 flex items-center justify-center">
            <Smile size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Success Evaluation</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={sentimentData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS_SENTIMENT[index % COLORS_SENTIMENT.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Hangup Reasons Chart */}
      <div className="bg-white border rounded-lg p-6 shadow-sm flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-red-500 text-white rounded-lg w-8 h-8 flex items-center justify-center">
            <PhoneMissed size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Hangup Reasons</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={hangupData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
            >
              {hangupData.map((entry, index) => (
                <Cell key={`cell-hangup-${index}`} fill={COLORS_HANGUP[index % COLORS_HANGUP.length]} />
              ))}
            </Pie>
            <Tooltip />
            {/* <Legend verticalAlign="bottom" height={36}/> */}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartsDashboard;