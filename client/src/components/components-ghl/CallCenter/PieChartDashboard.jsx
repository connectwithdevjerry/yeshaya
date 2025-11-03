import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Smile, PhoneMissed } from "lucide-react";

const COLORS_SENTIMENT = ["#f87171", "#fbbf24", "#2dd4bf"]; // red, orange, teal
const COLORS_HANGUP = ["#ef4444"]; // red

const generateRandomData = (labels) =>
  labels.map((label) => ({
    name: label,
    value: Math.floor(Math.random() * 100) + 10,
  }));

const ContactSentimentChart = () => {
  const data = useMemo(
    () => generateRandomData(["Negative", "Neutral", "Positive"]),
    []
  );

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg">
            <Smile size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Contact Sentiment
          </h2>
        </div>
        <div className="text-gray-500 text-sm">
          Last {Math.floor(Math.random() * 30)} days
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS_SENTIMENT[index % COLORS_SENTIMENT.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const HangupReasonsChart = () => {
  const data = useMemo(() => generateRandomData(["Customer Ended Call"]), []);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm flex-1">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-red-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg">
            <PhoneMissed size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Hangup Reasons
          </h2>
        </div>
        <div className="text-gray-500 text-sm">
          Last {Math.floor(Math.random() * 30)} days
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#ef4444"
            dataKey="value"
            labelLine={false}
          >
            <Cell fill={COLORS_HANGUP[0]} />
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const PieChartsDashboard = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <ContactSentimentChart />
      <HangupReasonsChart />
    </div>
  );
};

export default PieChartsDashboard;
