import React from "react";
import { CircleAlert } from "lucide-react";

const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border hover:shadow-md transition">
      <div className={`flex justify-between items-center ${color}`}>
        {icon}
        <button className="text-gray-400 hover:text-gray-600">
          <CircleAlert className="w-4 h-4" />
        </button>
      </div>
      <div className="text-gray-800 font-semibold text-sm">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default MetricCard;
