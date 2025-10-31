import React from "react";
import { CheckCircle, FileText } from "lucide-react";

const TransactionRow = ({
  description,
  time,
  date,
  status,
  eventId,
  amount,
}) => {
  const isNegative = amount.startsWith("-");
  const amountColor = isNegative
    ? "text-red-500 bg-red-50"
    : "text-green-500 bg-green-50";
  return (
    <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.5fr] gap-4 py-3 border-b text-sm items-center">
      {/* Description */}
      <div className="flex items-start">
        <CheckCircle className="w-5 h-5 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
        <div>
          <div className="font-medium text-gray-800">{description}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {time}, {date}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-green-600 font-medium">Succeeded</div>

      {/* Event ID */}
      <div className="text-gray-600 text-xs truncate">{eventId}</div>

      {/* Amount & Actions */}
      <div className="flex flex-col items-end">
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${amountColor}`}
        >
          {amount}
        </span>
        <div className="flex space-x-2 text-xs mt-1">
          <a href="#" className="text-indigo-600 hover:text-indigo-800">
            Event
          </a>
          <span>|</span>
          <a
            href="#"
            className="text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Invoice <FileText className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};
export default TransactionRow;
 