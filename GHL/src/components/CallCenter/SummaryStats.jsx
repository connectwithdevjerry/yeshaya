import React from "react";
import { Filter } from "lucide-react";

const SummaryStats = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <Filter
          size={32}
          className="text-gray-200 p-2 rounded-lg bg-purple-600"
        />
        <div className="flex  gap-2">
          <select className="border rounded-md px-2 py-1 text-sm">
            <option>Appointments</option>
            <option>Transfers</option>
          </select>
          <h3 className="text-gray-400 text-sm">Last 10.1 days</h3>
        </div>
      </div>

      <div className="grid h-[200px] grid-cols-4 ">
        <div className="border-r-2 border-gray-300">
          <div className="text-xl font-bold">{data.totalCalls}</div>
          <div className="text-yellow-600 text-sm">Dials</div>
          <div className="text-purple-400 font-bold ">0%</div>
        </div>
        <div className="border-r-2 pl-4 border-gray-300">
          <div className="text-lg font-bold">{data.inboundCalls}</div>
          <div className="text-yellow-600 text-sm">Answers</div>
          <div className="text-purple-400 font-bold ">0%</div>
        </div>
        <div className="border-r-2 pl-4 border-gray-300">
          <div className="text-lg font-bold">{data.transfers}</div>
          <div className="text-yellow-600 text-sm">Conversations</div>
          <div className="text-purple-400 font-bold ">0%</div>
        </div>
        <div className="border-r-2 pl-4">
          <div className="text-lg font-bold">{data.appointments}</div>
          <div className="text-yellow-600 text-sm">Appointments</div>
          <div className="text-purple-400 font-bold ">0%</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
