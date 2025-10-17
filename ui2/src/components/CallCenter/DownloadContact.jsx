import React from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

const DownloadContact = () => {
  const tableHeaders = [
    "Timestamp (start)",
    "Type",
    "To",
    "From",
    "Duration (mins)",
    "Direction",
    "Status",
    "End Reason",
  ];
  return (
    <div className="bg-gray-50 px-6  font-sans">
      <header className="flex justify-end items-center mb-6">
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors text-sm font-medium">
          <Download size={16} />
          <span>Download Calls</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {tableHeaders.map((header) => (
                  <th key={header} className="px-6 py-3 font-medium text-left">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody></tbody>
          </table>
        </div>

        <div className="text-center py-20">
          <p className="text-gray-500">No calls to display</p>
        </div>

        <footer className="flex justify-end items-center px-6 py-3 border-t border-gray-200 text-sm text-gray-600">
          <span>Page 1 of 1</span>
          <div className="flex items-center ml-4">
            <button disabled className="p-1 text-gray-400 cursor-not-allowed">
              <ChevronLeft size={20} />
            </button>
            <button disabled className="p-1 text-gray-400 cursor-not-allowed">
              <ChevronRight size={20} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default DownloadContact;
