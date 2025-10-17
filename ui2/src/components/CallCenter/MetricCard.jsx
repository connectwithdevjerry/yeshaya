import React from "react";
import { CircleAlert } from "lucide-react";

const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div
          className={`p-1 rounded-lg bg-opacity-10 flex items-center justify-center ${color}`}
          style={{ backgroundColor: `${getColorBackground(color)}` }}
        >
          <div className="text-gray-100">{icon}</div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <CircleAlert className="w-4 h-4" />
        </button>
      </div>
      <div className="text-gray-400 text-[12px]">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

// Helper function: map Tailwind text colors to background equivalents
function getColorBackground(colorClass) {
  const colorMap = {
    "text-blue-500": "#3B82F6",
    "text-green-500": "#22C55E",
    "text-yellow-500": "#EAB308",
    "text-purple-500": "#A855F7",
    "text-red-500": "#EF4444",
    "text-amber-600": "#D97706",
    "text-amber-700": "#B45309",
    "text-amber-800": "#92400E",
    "text-teal-600": "#0D9488",
    "text-emerald-600": "#059669",
    "text-orange-500": "#F97316",
    "text-sky-500": "#0EA5E9",
    "text-rose-500": "#F43F5E",
    "text-green-700": "#15803D",
  };
  return colorMap[colorClass] || "#9CA3AF"; // default gray
}

export default MetricCard;
