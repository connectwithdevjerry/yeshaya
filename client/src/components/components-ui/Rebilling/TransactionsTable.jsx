// src/components/components-ui/Rebilling/TransactionsTable.jsx
import React from "react";
import { Phone, CheckCircle2, Download } from "lucide-react";
import { motion } from "framer-motion";
import { transactionData } from "../../../data/accountsData-ui";

const TransactionsTable = () => {
  const handleExportCSV = () => {
    console.log("Export CSV — not yet implemented");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Recent transactions</h3>
          <p className="text-xs text-gray-500 mt-0.5">Voice calls and number rentals (live feed)</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80">
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Description</th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Time</th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactionData.map((tx, idx) => (
            <motion.tr
              key={tx.eventId || idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="hover:bg-indigo-50/30 transition-colors"
            >
              {/* Description */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-800 truncate max-w-xs">{tx.description}</span>
                </div>
              </td>

              {/* Time */}
              <td className="px-5 py-3.5 text-sm text-gray-500 tabular-nums whitespace-nowrap">
                {tx.time}
              </td>

              {/* Status */}
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" />
                  {tx.status}
                </span>
              </td>

              {/* Amount */}
              <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                {tx.amount}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
