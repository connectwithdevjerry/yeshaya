// src/components/components-ui/Setting/Wallet/TransactionRow.jsx
import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

const TransactionRow = ({ description, time, date, eventId, amount }) => {
  const isTopUp = description.includes("TOPUP");

  const formattedAmount = isTopUp
    ? `+$${parseFloat(amount).toFixed(2)}`
    : `-$${parseFloat(amount).toFixed(4)}`;

  return (
    <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.5fr] gap-4 py-3.5 border-b border-gray-50 last:border-b-0 items-center text-sm hover:bg-gray-50/50 transition-colors px-1 rounded-lg group">

      {/* Description */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
          ${isTopUp ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-500"}`}>
          {isTopUp
            ? <ArrowDownLeft className="w-3.5 h-3.5" />
            : <ArrowUpRight  className="w-3.5 h-3.5" />
          }
        </div>
        <div className="min-w-0">
          <p className="font-medium text-gray-800 truncate">{description}</p>
          <p className="text-xs text-gray-400 mt-0.5">{time}, {date}</p>
        </div>
      </div>

      {/* Status */}
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold w-fit">
        Succeeded
      </span>

      {/* Event ID */}
      <span className="text-xs text-gray-400 font-mono truncate" title={eventId}>{eventId || "—"}</span>

      {/* Amount */}
      <div className="flex justify-end">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl
          ${isTopUp
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-red-50 text-red-600 border border-red-100"
          }`}>
          {formattedAmount}
        </span>
      </div>
    </div>
  );
};

export default TransactionRow;
