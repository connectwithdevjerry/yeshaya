import React, { useState } from "react";
import { CircleAlert } from "lucide-react";

const MetricCard = ({ icon, label, value, color, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border hover:shadow-md transition">
      <div className="flex justify-between items-start relative">
        {/* Colored icon background */}
        <div
          className={`p-1 rounded-lg flex items-center justify-center ${getBgClass(
            color
          )}`}
        >
          <div className="text-gray-200">{icon}</div>
        </div>

        {/* CircleAlert icon with tooltip */}
        <div
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button className="text-gray-400 hover:text-gray-600">
            <CircleAlert className="w-4 h-4" />
          </button>

          {/* Tooltip */}
          {showTooltip && (
            <div className="absolute right-[-45px] top-6 bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg z-10 transition-all duration-150 ease-in-out opacity-100 translate-y-0 animate-fadeIn">
              {tooltip}
              {/* Tooltip Arrow */}
              <div className="absolute top-[-4px] right-2 w-2 h-2 bg-black rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      {/* Label + Value */}
      <div className="text-gray-400 text-[12px]">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

// Helper to map text color → bg color
function getBgClass(color) {
  const map = {
    "text-blue-500": "bg-blue-500",
    "text-green-500": "bg-green-500",
    "text-yellow-500": "bg-yellow-500",
    "text-purple-500": "bg-purple-500",
    "text-red-500": "bg-red-500",
    "text-amber-600": "bg-amber-600",
    "text-amber-700": "bg-amber-700",
    "text-amber-800": "bg-amber-800",
    "text-teal-600": "bg-teal-600",
    "text-emerald-600": "bg-emerald-600",
    "text-orange-500": "bg-orange-500",
    "text-sky-500": "bg-sky-500",
    "text-rose-500": "bg-rose-500",
    "text-green-700": "bg-green-700",
  };
  return map[color] || "bg-gray-400";
}

export default MetricCard;
