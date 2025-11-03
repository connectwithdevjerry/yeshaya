import React from "react";
import { Zap, Info, ChevronDown } from "lucide-react";

const AutopayToggle = () => {
  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm col-span-1 md:col-span-2">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center">
          <Zap className="w-5 h-5 text-indigo-500 mr-2" />
          <span className="text-lg font-semibold text-gray-800">
            ENABLE AUTOPAY
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            defaultChecked
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            When my balance gets below
            <span
              className="ml-1 text-gray-400 cursor-help"
              title="Minimum balance threshold"
            >
              <Info className="w-4 h-4" />
            </span>
          </label>
          <div className="relative">
            <select className="pl-3 pr-8 py-1 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option>$25</option>
              <option>$50</option>
              <option>$100</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            Re-fill my wallet with
            <span
              className="ml-1 text-gray-400 cursor-help"
              title="Amount to refill"
            >
              <Info className="w-4 h-4" />
            </span>
          </label>
          <div className="relative">
            <select className="pl-3 pr-8 py-1 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option>$25</option>
              <option>$50</option>
              <option>$100</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutopayToggle;
