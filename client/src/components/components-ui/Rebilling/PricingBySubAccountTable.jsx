// src/components/components-ui/Rebilling/PricingBySubAccountTable.jsx
import React from "react";
import { Edit } from "lucide-react";
import { motion } from "framer-motion";

const TONE_MAP = {
  indigo:  { from: "from-indigo-500",  to: "to-violet-600"  },
  violet:  { from: "from-violet-500",  to: "to-purple-600"  },
  emerald: { from: "from-emerald-500", to: "to-teal-600"    },
  amber:   { from: "from-amber-500",   to: "to-orange-600"  },
  rose:    { from: "from-rose-500",    to: "to-pink-600"    },
};

const REBILL_SUBS = [
  { name: "Salvation Solutions",  tone: "violet",  voiceRate: 0.10, numRate: 4.0, margin: 42 },
  { name: "Coastal Realty Group", tone: "emerald", voiceRate: 0.12, numRate: 5.0, margin: 58 },
  { name: "Bright Dental Co.",    tone: "amber",   voiceRate: 0.09, numRate: 3.0, margin: 24 },
  { name: "Northwind Insurance",  tone: "rose",    voiceRate: 0.15, numRate: 6.0, margin: 71 },
];

const PricingBySubAccountTable = () => {
  const handleEditDefaults = () => {
    console.log("Edit defaults clicked — modal not yet built");
  };

  const handleEditRow = (sub) => {
    console.log("Edit margin for:", sub.name, "— modal not yet built");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Pricing by sub-account</h3>
          <p className="text-xs text-gray-500 mt-0.5">Set your markup over base costs</p>
        </div>
        <button
          onClick={handleEditDefaults}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit defaults
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80">
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Sub-account</th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Voice / min</th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Number / mo</th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Margin</th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {REBILL_SUBS.map((sub, idx) => {
            const tone = TONE_MAP[sub.tone] || TONE_MAP.indigo;
            return (
              <motion.tr
                key={sub.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="hover:bg-indigo-50/30 transition-colors group"
              >
                {/* Sub-account */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tone.from} ${tone.to} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                      {sub.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{sub.name}</span>
                  </div>
                </td>

                {/* Voice rate */}
                <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 tabular-nums">
                  ${sub.voiceRate.toFixed(2)}
                </td>

                {/* Number rate */}
                <td className="px-5 py-3.5 text-sm font-semibold text-gray-700 tabular-nums">
                  ${sub.numRate.toFixed(2)}
                </td>

                {/* Margin */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                        style={{ width: `${sub.margin}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {sub.margin}%
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleEditRow(sub)}
                    className="text-xs font-semibold text-indigo-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Edit →
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PricingBySubAccountTable;
