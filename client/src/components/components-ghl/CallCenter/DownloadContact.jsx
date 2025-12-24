import React from "react";
import { 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  RotateCcw, 
  ArrowDownToLine, 
  MoreHorizontal 
} from "lucide-react";

const DownloadContact = () => {
  const tableHeaders = [
    { label: "Timestamp (start)", width: "w-[15%]" },
    { label: "Type", width: "w-[10%]" },
    { label: "To", width: "w-[12%]" },
    { label: "From", width: "w-[12%]" },
    { label: "Duration", width: "w-[10%]" },
    { label: "Direction", width: "w-[10%]" },
    { label: "Status", width: "w-[10%]" },
    { label: "End Reason", width: "w-[21%]" },
  ];

  const callData = [
    {
      timestamp: "12/04/25, 10:19 pm",
      type: "Web Call",
      to: "Browser",
      from: "Browser",
      duration: "0.54 mins",
      direction: "Inbound",
      status: "Ended",
      reason: "Contact Hangup"
    },
    {
      timestamp: "11/28/25, 11:45 pm",
      type: "Phone Call",
      to: "+18666102015",
      from: "+2349137628206",
      duration: "1.78 mins",
      direction: "Inbound",
      status: "Ended",
      reason: "Contact Hangup"
    }
  ];

  return (
    <div className="bg-[#f9fafb] min-h-screen p-4 font-sans text-gray-900 max-w-full overflow-x-hidden">
      {/* Filters Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="">

          </div>
          <button className="bg-[#0f172a] text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-slate-800 transition-all text-xs font-semibold shrink-0">
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>

      </div>

      {/* Table Section */}
      <main className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-800">Home</h2>
          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">2 Records</span>
        </div>
        
        {/* Fixed Table Container */}
        <div className="w-full">
          <table className="w-full text-sm text-left table-fixed border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] text-[#64748b] border-b border-gray-100">
                {tableHeaders.map((header) => (
                  <th key={header.label} className={`px-4 py-4 font-semibold truncate ${header.width}`}>
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {callData.map((call, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 truncate font-medium">{call.timestamp}</td>
                  <td className="px-4 py-4 truncate text-gray-600">{call.type}</td>
                  <td className="px-4 py-4 truncate font-bold">{call.to}</td>
                  <td className="px-4 py-4 truncate font-bold">{call.from}</td>
                  <td className="px-4 py-4 truncate font-bold">{call.duration}</td>
                  <td className="px-4 py-4 truncate font-bold">{call.direction}</td>
                  <td className="px-4 py-4 truncate font-bold">{call.status}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[80px] px-2 py-0.5 border border-gray-200 rounded text-[10px] text-gray-500">
                        {call.reason}
                      </span>
                      <div className="flex shrink-0">
                         <button className="p-1 text-gray-400 hover:text-gray-600"><RotateCcw size={14} /></button>
                         <button className="p-1 text-gray-400 hover:text-gray-600"><MoreHorizontal size={14} /></button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <footer className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-100 text-xs text-gray-500">
          <span className="hidden sm:inline">Showing 1 to 2 of 2 entries</span>
          <div className="flex items-center gap-2 ml-auto">
            <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronLeft size={16} /></button>
            <span className="px-2 py-1 border border-gray-200 rounded bg-gray-50 font-bold text-gray-800">1</span>
            <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DownloadContact;