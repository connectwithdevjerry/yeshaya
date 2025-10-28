import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
} from "recharts";
import { FilterIcon } from "lucide-react";

const FunnelVisual = () => {
  // Dynamically generate random dummy data
  const data = useMemo(() => {
    const totalDials = Math.floor(Math.random() * 10) + 10; // 10–20
    const answers = Math.floor(totalDials * (0.8 + Math.random() * 0.2));
    const conversations = Math.floor(answers * (0.6 + Math.random() * 0.3));
    const appointments = Math.floor(conversations * (0.05 + Math.random() * 0.3));

    return [
      { name: "Dials", value: totalDials },
      { name: "Answers", value: answers },
      { name: "Conversations", value: conversations },
      { name: "Appointments", value: appointments },
    ];
  }, []);

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg">
            <FilterIcon size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Sales Funnel</h2>
        </div>
        <div className="text-gray-500 text-sm">Last {Math.floor(Math.random() * 30)} days</div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <FunnelChart>
          <Tooltip />
          <Funnel
            dataKey="value"
            data={data}
            isAnimationActive
            fill="url(#colorGradient)"
          >
            <LabelList
              position="right"
              fill="#000"
              stroke="none"
              dataKey="name"
              formatter={(name) => name}
            />
          </Funnel>

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />  {/* Indigo */}
              <stop offset="50%" stopColor="#ec4899" /> {/* Pink */}
              <stop offset="100%" stopColor="#f59e0b" /> {/* Amber */}
            </linearGradient>
          </defs>
        </FunnelChart>
      </ResponsiveContainer>

      <div className="flex justify-around mt-4 text-center">
        {data.map((stage, idx) => {
          const percentage = ((stage.value / data[0].value) * 100).toFixed(1);
          return (
            <div key={idx}>
              <div className="text-lg font-bold">{stage.value}</div>
              <div className="text-yellow-600 font-semibold text-sm">{stage.name}</div>
              <div className="text-indigo-500 text-xs">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelVisual;
