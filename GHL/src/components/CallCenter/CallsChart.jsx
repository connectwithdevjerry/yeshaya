import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { PhoneCall, Mic } from "lucide-react"; // 👈 Lucide icons

// Generate random dummy time-series data
const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 3); // spaced 3 days apart
    data.push({
      date: d.toLocaleDateString("en-GB"),
      calls: Math.floor(Math.random() * 5) + 1,
      minutes: Math.floor(Math.random() * 6) + 1,
    });
  }
  return data;
};

const ChartCard = ({ title, value, unit, color, dataKey, data }) => (
  <div className="bg-white border rounded-lg p-6 shadow-sm mb-4">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "22" }} // translucent background
        >
          {dataKey === "calls" ? (
            <PhoneCall className="w-5 h-5" style={{ color }} />
          ) : (
            <Mic className="w-5 h-5" style={{ color }} />
          )}
        </div>
        <div>
          <h2 className="text-gray-700 font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">
            {value} {unit}
          </p>
        </div>
      </div>
      <div className="text-gray-500 text-sm">Last 20.8 days</div>
    </div>

    {/* Chart */}
    <div className="w-full h-56">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
          <YAxis stroke="#aaa" fontSize={12} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
            fillOpacity={0.15}
            fill={color + "33"}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const CallCharts = () => {
  const data = useMemo(() => generateData(), []);
  const totalCalls = data.reduce((sum, d) => sum + d.calls, 0);
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <ChartCard
        title="Call Volume"
        value={totalCalls}
        unit="calls"
        color="#6366F1"
        dataKey="calls"
        data={data}
      />
      <ChartCard
        title="Call Minutes"
        value={totalMinutes}
        unit="mins"
        color="#10B981"
        dataKey="minutes"
        data={data}
      />
    </div>
  );
};

export default CallCharts;
