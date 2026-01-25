import React, { useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
} from "recharts";
import { FilterIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAssistantAnalytics } from "../../../store/slices/assistantsSlice";

const FunnelVisual = () => {
  const dispatch = useDispatch();

  const analytics = useSelector(
    (state) => state.assistants.analytics?.data
  );

  useEffect(() => {
    dispatch(getAssistantAnalytics());
  }, [dispatch]);

  // ✅ Use real backend data
  const data = useMemo(() => {
    if (!analytics) return [];

    return [
      { name: "Dials", value: analytics.outboundCalls },
      { name: "Answered", value: analytics.contactEnds },
      { name: "AI Ends", value: analytics.aiEnds },
      { name: "Appointments", value: analytics.appointments },
    ];
  }, [analytics]);

  if (!data.length) return <div>Loading funnel...</div>;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500 text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg">
            <FilterIcon size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Sales Funnel
          </h2>
        </div>
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
            <LabelList dataKey="name" position="right" fill="#000" />
          </Funnel>

          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </FunnelChart>
      </ResponsiveContainer>

      <div className="flex justify-around mt-4 text-center">
        {data.map((stage, idx) => {
          const percentage = (
            (stage.value / data[0].value) *
            100
          ).toFixed(1);

          return (
            <div key={idx}>
              <div className="text-lg font-bold">{stage.value}</div>
              <div className="text-yellow-600 font-semibold text-sm">
                {stage.name}
              </div>
              <div className="text-indigo-500 text-xs">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FunnelVisual;
