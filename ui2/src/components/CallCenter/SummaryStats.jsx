import React from "react";

const SummaryStats = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-700 font-semibold">Appointments</h3>
        <select className="border rounded-md px-2 py-1 text-sm">
          <option>Last 10.1 days</option>
        </select>
      </div>

      <div className="grid grid-cols-4 text-center">
        <div>
          <div className="text-lg font-bold">{data.totalCalls}</div>
          <div className="text-purple-500 text-sm">Dials</div>
          <div className="text-yellow-600 text-xs">0%</div>
        </div>
        <div>
          <div className="text-lg font-bold">{data.inboundCalls}</div>
          <div className="text-yellow-600 text-sm">Answers</div>
          <div className="text-yellow-600 text-xs">0%</div>
        </div>
        <div>
          <div className="text-lg font-bold">{data.transfers}</div>
          <div className="text-yellow-600 text-sm">Conversations</div>
          <div className="text-yellow-600 text-xs">0%</div>
        </div>
        <div>
          <div className="text-lg font-bold">{data.appointments}</div>
          <div className="text-yellow-600 text-sm">Appointments</div>
          <div className="text-yellow-600 text-xs">0%</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
