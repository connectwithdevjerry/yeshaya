// src/components/settings/DomainTab.jsx
import React, { useState } from "react";
import { Button } from "../ui/Button";
import { Globe, Trash2, ArrowUpRight, Copy, Info } from "lucide-react";

export default function DomainTab() {
  const [records, setRecords] = useState([
    { type: "A", name: "@", value: "76.76.21.21" },
  ]);

  const [domain, setDomain] = useState({
    name: "yashayah.ai",
    status: "Not configured",
  });

  const updateRecord = (index, key, value) => {
    const newRecords = [...records];
    newRecords[index][key] = value;
    setRecords(newRecords);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Globe size={20} className="text-blue-600" />
        Custom Domain
      </h2>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Info Section */}
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 p-3 rounded-md">
          <Info size={16} className="text-blue-500 mt-0.5" />
          <p>
            Connect a white-labeled domain to mask the platform. Connect either
            a domain or a sub-domain that is not currently in use to our system
            and you can use that domain to access the platform. Remember, DNS
            records can take up to 48 hours to populate.
          </p>
        </div>

        {/* DNS Records */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Add DNS records</h3>

          {records.map((record, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center bg-white border border-gray-200 rounded-lg p-3 relative"
            >
              {/* Record Type */}
              <div className="relative">
                <input
                  value={record.type}
                  onChange={(e) =>
                    updateRecord(index, "type", e.target.value.toUpperCase())
                  }
                  placeholder="Record Type (A)"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-100"
                />
                <Copy
                  size={16}
                  className="absolute right-2 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                />
              </div>

              {/* Record Name */}
              <div className="relative">
                <input
                  value={record.name}
                  onChange={(e) => updateRecord(index, "name", e.target.value)}
                  placeholder="Record Name (@)"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-100"
                />
                <Copy
                  size={16}
                  className="absolute right-2 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                />
              </div>

              {/* Record Value */}
              <div className="relative">
                <input
                  value={record.value}
                  onChange={(e) => updateRecord(index, "value", e.target.value)}
                  placeholder="Record Value (76.76.21.21)"
                  className="w-full border rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-100"
                />
                <Copy
                  size={16}
                  className="absolute right-2 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                />
              </div>

              {/* Delete Icon (mobile) */}
              <button className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 hover:bg-gray-100 md:hidden">
                <Trash2 size={14} className="text-gray-500" />
              </button>
            </div>
          ))}

          <div className="flex justify-end mt-4">
            <button className="text-sm bg-white py-3 px-6 border text-gray-500 font-semibold rounded-md hover:bg-gray-50 transition">
              Verify Records
            </button>
          </div>
        </div>

        {/* Connected Domain */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-gray-600" />
              <span className="font-medium">{domain.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                Default
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {domain.status}
              </span>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Trash2 size={16} className="text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <ArrowUpRight size={16} className="text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
