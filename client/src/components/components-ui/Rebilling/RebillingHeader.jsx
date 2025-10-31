import React from "react";
import { CheckCircle, Trash2, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AgencyHeader = () => {

  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center border border-gray-200 bg-white rounded-xl px-4 py-3 mb-6 shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="font-medium text-gray-800">Verius Enterprise</span>
        <button className="bg-gray-100 text-xs text-blue-600 px-2 py-1 rounded">
          acct_...5pLpk
        </button>
      </div>

      <div className="flex items-center space-x-3">
        <span className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <CheckCircle size={14} className="mr-1" /> Connected
        </span>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Trash2 size={16} className="text-gray-500" />
        </button>
        <button onClick={() => navigate("/homepage")} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowUpRight size={16} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default AgencyHeader;
