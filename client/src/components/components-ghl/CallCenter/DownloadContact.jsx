import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  ArrowDownToLine,
  MoreHorizontal,
  Loader2,
  X,
} from "lucide-react";

import { getAssistantCallLogs } from "../../../store/slices/assistantsSlice";

const DownloadContact = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Get data from Redux store
  const { callLogs, fetchingLogs, logsError } = useSelector((state) => {
    console.log("🔍 Full Redux State:", state.assistants);
    return {
      callLogs: state.assistants?.callLogs || [],
      fetchingLogs: state.assistants?.fetchingLogs || false,
      logsError: state.assistants?.logsError || null,
    };
  });

  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      console.log("🔍 Component mounted - Fetching call logs...");
      setHasFetched(true);
      dispatch(getAssistantCallLogs())
        .unwrap()
        .then((data) => {
          console.log("✅ Dispatch successful, data received:", data);
        })
        .catch((error) => {
          console.error("❌ Dispatch failed:", error);
        });
    }
  }, [dispatch, hasFetched]);

  const tableHeaders = [
    { label: "Timestamp (start)", width: "w-[15%]" },
    { label: "Type", width: "w-[10%]" },
    { label: "Duration", width: "w-[10%]" },
    { label: "Status", width: "w-[10%]" },
    { label: "End Reason", width: "w-[15%]" },
    { label: "Transcript Preview", width: "w-[30%]" },
    { label: "Actions", width: "w-[10%]" },
  ];

  // Format the call data from API response
  const formatCallData = (logs) => {
    if (!Array.isArray(logs)) return [];

    return logs.map((call) => ({
      id: call.id,
      timestamp: new Date(call.startedAt).toLocaleString(),
      rawTimestamp: new Date(call.startedAt),
      type: call.type === "webCall" ? "Web Call" : "Phone Call",
      duration: `${((new Date(call.endedAt) - new Date(call.startedAt)) / 60000).toFixed(2)} mins`,
      status: call.status.charAt(0).toUpperCase() + call.status.slice(1),
      endReason:
        call.endedReason
          ?.replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A",
      transcript: call.transcript || "No transcript available",
      summary: call.summary || "",
      recordingUrl: call.recordingUrl || "",
      rawData: call,
    }));
  };

  const formattedData = formatCallData(callLogs);

  // Apply filters
  const filteredData = formattedData.filter((call) => {
    const matchesSearch =
      searchTerm === "" ||
      call.transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.endReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      call.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" ||
      call.type.toLowerCase().includes(typeFilter.toLowerCase());

    // Better Date Range Comparison
    let matchesDateRange = true;
    const callDate = new Date(call.rawTimestamp).setHours(0, 0, 0, 0);

    if (dateRange.start) {
      const startDate = new Date(dateRange.start).setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && callDate >= startDate;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).setHours(0, 0, 0, 0);
      matchesDateRange = matchesDateRange && callDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  // CSV Download Function
  const downloadTranscriptsAsCSV = () => {
    setIsDownloading(true);
    try {
      const headers = [
        "Call ID",
        "Timestamp",
        "Type",
        "Duration",
        "Status",
        "End Reason",
        "Summary",
        "Transcript",
      ];

      const escapeCSV = (str) => {
        if (!str) return '""';
        // Wrap in quotes and escape existing double quotes
        return `"${String(str).replace(/"/g, '""')}"`;
      };

      const csvRows = filteredData.map((call) =>
        [
          escapeCSV(call.id),
          escapeCSV(call.timestamp),
          escapeCSV(call.type),
          escapeCSV(call.duration),
          escapeCSV(call.status),
          escapeCSV(call.endReason),
          escapeCSV(call.summary),
          escapeCSV(call.transcript),
        ].join(","),
      );

      const csvContent = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `calls_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, dateRange]);

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (dateRange.start || dateRange.end ? 1 : 0);

  return (
    <div className="bg-[#f9fafb] h-screen flex flex-col overflow-hidden no-scrollbar">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 py-2 px-4 bg-[#f9fafb]">
        {/* Title and Download Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Call Logs</h1>
            {fetchingLogs && <Loader2 className="animate-spin" size={20} />}
          </div>
          <button
            onClick={downloadTranscriptsAsCSV}
            disabled={isDownloading || filteredData.length === 0}
            className="bg-[#0f172a] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-slate-800 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download CSV</span>
              </>
            )}
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {/* Search Filter */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search transcripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="ended">Ended</option>
              <option value="in-progress">In Progress</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="web">Web Call</option>
              <option value="phone">Phone Call</option>
            </select>

            {/* Date Range */}
            <div className="flex  gap-1">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="flex-1  py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Start date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="flex-1  py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="End date"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {logsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {logsError}
          </div>
        )}
      </div>

      {/* Scrollable Table Section */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800">Call Records</h2>
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">
              {filteredData.length} of {formattedData.length} Records
            </span>
          </div>

          {/* Loading State */}
          {fetchingLogs ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin" size={32} />
                <span className="text-gray-500">Loading call logs...</span>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">
                  {formattedData.length === 0
                    ? "No call logs found"
                    : "No results match your filters"}
                </p>
                {activeFiltersCount > 0 && formattedData.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Scrollable Table Container */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left table-fixed border-collapse min-w-[900px]">
                  <thead className="sticky top-0 bg-[#f8fafc] z-10">
                    <tr className="text-[#64748b] border-b border-gray-200">
                      {tableHeaders.map((header) => (
                        <th
                          key={header.label}
                          className={`px-4 py-2 font-semibold truncate ${header.width}`}
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentData.map((call, idx) => (
                      <tr
                        key={call.id || idx}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 truncate font-medium text-xs">
                          {call.timestamp}
                        </td>
                        <td className="px-4 py-3 truncate text-gray-600">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {call.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 truncate font-bold">
                          {call.duration}
                        </td>
                        <td className="px-4 py-3 truncate">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              call.status === "Ended"
                                ? "bg-green-50 text-green-700"
                                : "bg-yellow-50 text-yellow-700"
                            }`}
                          >
                            {call.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 truncate text-xs text-gray-600">
                          {call.endReason}
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className="truncate text-xs text-gray-500"
                            title={call.transcript}
                          >
                            {call.transcript.substring(0, 80)}...
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                window.open(call.recordingUrl, "_blank")
                              }
                              className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30"
                              title="View Recording"
                              disabled={!call.recordingUrl}
                            >
                              <ArrowDownToLine size={14} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <footer className="flex-shrink-0 flex justify-between items-center px-4 py-3 bg-white border-t border-gray-100 text-xs text-gray-500">
                <span className="hidden sm:inline">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredData.length)} of{" "}
                  {filteredData.length} entries
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 py-1 border border-gray-200 rounded bg-gray-50 font-bold text-gray-800">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadContact;
