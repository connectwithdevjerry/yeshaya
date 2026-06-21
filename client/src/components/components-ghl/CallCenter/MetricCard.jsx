// src/components/components-ghl/CallCenter/MetricCard.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

/* ── Color theme map ── */
const THEMES = {
  "text-blue-500":    { soft: "bg-blue-50",    icon: "text-blue-500",    bar: "bg-blue-500"    },
  "text-green-500":   { soft: "bg-emerald-50", icon: "text-emerald-500", bar: "bg-emerald-500" },
  "text-yellow-500":  { soft: "bg-yellow-50",  icon: "text-yellow-500",  bar: "bg-yellow-400"  },
  "text-purple-500":  { soft: "bg-purple-50",  icon: "text-purple-500",  bar: "bg-purple-500"  },
  "text-red-500":     { soft: "bg-red-50",     icon: "text-red-500",     bar: "bg-red-500"     },
  "text-amber-600":   { soft: "bg-amber-50",   icon: "text-amber-600",   bar: "bg-amber-500"   },
  "text-amber-700":   { soft: "bg-amber-50",   icon: "text-amber-700",   bar: "bg-amber-600"   },
  "text-amber-800":   { soft: "bg-amber-50",   icon: "text-amber-800",   bar: "bg-amber-700"   },
  "text-teal-600":    { soft: "bg-teal-50",    icon: "text-teal-600",    bar: "bg-teal-500"    },
  "text-emerald-600": { soft: "bg-emerald-50", icon: "text-emerald-600", bar: "bg-emerald-500" },
  "text-orange-500":  { soft: "bg-orange-50",  icon: "text-orange-500",  bar: "bg-orange-500"  },
  "text-sky-500":     { soft: "bg-sky-50",     icon: "text-sky-500",     bar: "bg-sky-500"     },
  "text-rose-500":    { soft: "bg-rose-50",    icon: "text-rose-500",    bar: "bg-rose-500"    },
  "text-green-700":   { soft: "bg-green-50",   icon: "text-green-700",   bar: "bg-green-600"   },
};

const MetricCard = ({ icon, label, value, color, tooltip, index = 0 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const theme = THEMES[color] || { soft: "bg-gray-50", icon: "text-gray-500", bar: "bg-gray-400" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden p-4 hover:shadow-lg hover:shadow-gray-100/80 transition-shadow group cursor-default"
    >
      {/* Left accent bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-[3px] ${theme.bar}`} />

      {/* Top row: icon + tooltip */}
      <div className="flex items-start justify-between mb-3 pl-1">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.soft}`}>
          <span className={`[&>svg]:w-4 [&>svg]:h-4 ${theme.icon}`}>{icon}</span>
        </div>

        {/* Tooltip trigger */}
        <div
          className="relative flex-shrink-0"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button className="p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors">
            <Info className="w-3.5 h-3.5" />
          </button>

          {showTooltip && tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.12 }}
              className="absolute bottom-full right-0 mb-2 z-50 w-52 bg-gray-900 text-white text-[11px] leading-relaxed px-3 py-2 rounded-xl shadow-xl"
            >
              {tooltip}
              <div className="absolute -bottom-1 right-3 w-2 h-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </div>
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-gray-900 leading-none pl-1 mb-1.5 tabular-nums">
        {value}
      </p>

      {/* Label */}
      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide pl-1">
        {label}
      </p>

      {/* Subtle hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-gray-50/0 group-hover:to-gray-50/50 transition-all duration-300 pointer-events-none rounded-2xl" />
    </motion.div>
  );
};

export default MetricCard;
