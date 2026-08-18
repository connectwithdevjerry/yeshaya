// src/components/components-ghl/CallCenter/DownloadContact.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Download, ChevronLeft, ChevronRight,
  Search, Filter, ArrowDownToLine, Eye,
  Loader2, X, Phone, Globe, PhoneCall, FileText, Play,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAssistantCallLogs } from "../../../store/slices/assistantsSlice";
<<<<<<< HEAD:client/src/components/components-ghl/CallCenter/CallList.jsx
import { RefreshCw } from "lucide-react";
=======
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

const selectCls =
  "appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer";

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
  </svg>
);

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const styles = {
    Ended:       "bg-emerald-50 text-emerald-700 border-emerald-100",
    "In-Progress": "bg-amber-50  text-amber-700  border-amber-100",
  };
  return (
    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full border font-semibold ${styles[status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
      {status}
    </span>
  );
};

/* ── Type badge ── */
const TypeBadge = ({ type }) => {
  const isWeb = type === "Web Call";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold
      ${isWeb ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-sky-50 text-sky-700 border-sky-100"}`}>
      {isWeb ? <Globe className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
      {type}
    </span>
  );
};
>>>>>>> projects-ui:client/src/components/components-ghl/CallCenter/DownloadContact.jsx

const CallList = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [dateRange,    setDateRange]    = useState({ start: "", end: "" });
  const [hasFetched,   setHasFetched]   = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);

<<<<<<< HEAD:client/src/components/components-ghl/CallCenter/CallList.jsx
  // Get data from Redux store
  const { callLogs, fetchingLogs, logsError } = useSelector((state) => {
    console.log("🔍 Full Redux State:", state.assistants);
    return {
      callLogs: state.assistants?.callLogs || [],
      fetchingLogs: state.assistants?.fetchingLogs || false,
      logsError: state.assistants?.logsError || null,
    };
  });

  useEffect(() => {
    // Prevent bombardment of API: Only fetch if empty, relying on Redux cache
    if (callLogs.length === 0 && !fetchingLogs) {
      console.log("🔍 CallList mounted - Cache empty, fetching call logs...");
      dispatch(getAssistantCallLogs());
    }
  }, [dispatch, callLogs.length, fetchingLogs]);

  const handleRefreshData = () => {
    dispatch(getAssistantCallLogs());
  };
=======
  const { callLogs, fetchingLogs, logsError } = useSelector((state) => ({
    callLogs:    state.assistants?.callLogs    || [],
    fetchingLogs: state.assistants?.fetchingLogs || false,
    logsError:   state.assistants?.logsError   || null,
  }));

  useEffect(() => {
    dispatch(getAssistantCallLogs(subaccountId));
  }, [dispatch, subaccountId]);
>>>>>>> projects-ui:client/src/components/components-ghl/CallCenter/DownloadContact.jsx

  /* ── Format logs ── */
  const formattedData = React.useMemo(() => {
    if (!Array.isArray(callLogs)) return [];
    return callLogs.map((call) => ({
      id:           call.id,
      timestamp:    new Date(call.startedAt).toLocaleString(),
      rawTimestamp: new Date(call.startedAt),
      type:         call.type === "webCall" ? "Web Call" : "Phone Call",
      duration: (() => {
        const start = new Date(call.startedAt);
        const end   = new Date(call.endedAt);
        if (isNaN(start) || isNaN(end) || end < start) return "0.00 mins";
        return `${((end - start) / 60000).toFixed(2)} mins`;
      })(),
      status:     call.status.charAt(0).toUpperCase() + call.status.slice(1),
      endReason:  call.endedReason?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "N/A",
      transcript: call.transcript || "No transcript available",
      summary:    call.summary    || "",
      recordingUrl: call.recordingUrl || "",
    }));
  }, [callLogs]);

  /* ── Filter ── */
  const filteredData = React.useMemo(() => {
    return formattedData.filter((call) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || call.transcript.toLowerCase().includes(q) || call.endReason.toLowerCase().includes(q) || call.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || call.status.toLowerCase() === statusFilter.toLowerCase();
      const matchType   = typeFilter   === "all" || call.type.toLowerCase().includes(typeFilter.toLowerCase());
      const callDate    = new Date(call.rawTimestamp).setHours(0, 0, 0, 0);
      let   matchDate   = true;
      if (dateRange.start) matchDate = matchDate && callDate >= new Date(dateRange.start).setHours(0, 0, 0, 0);
      if (dateRange.end)   matchDate = matchDate && callDate <= new Date(dateRange.end).setHours(0, 0, 0, 0);
      return matchSearch && matchStatus && matchType && matchDate;
    });
  }, [formattedData, searchTerm, statusFilter, typeFilter, dateRange]);

  /* ── Pagination ── */
  const itemsPerPage = 10;
  const totalPages   = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentData  = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, typeFilter, dateRange]);

  const activeFiltersCount =
    (searchTerm ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (typeFilter   !== "all" ? 1 : 0) +
    (dateRange.start || dateRange.end ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateRange({ start: "", end: "" });
  };

  /* ── CSV download ── */
  const downloadCSV = () => {
    setIsDownloading(true);
    try {
      const esc  = (s) => s ? `"${String(s).replace(/"/g, '""')}"` : '""';
      const rows = filteredData.map((c) =>
        [c.id, c.timestamp, c.type, c.duration, c.status, c.endReason, c.summary, c.transcript].map(esc).join(",")
      );
      const csv  = ["Call ID,Timestamp,Type,Duration,Status,End Reason,Summary,Transcript", ...rows].join("\n");
      const link = Object.assign(document.createElement("a"), {
        href:     URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })),
        download: `calls_${new Date().toISOString().split("T")[0]}.csv`,
      });
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) { console.error(e); }
    finally { setIsDownloading(false); }
  };

  return (
<<<<<<< HEAD:client/src/components/components-ghl/CallCenter/CallList.jsx
    <div className="bg-[#f9fafb] h-[calc(100vh-60px)] flex flex-col overflow-hidden no-scrollbar">
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
=======
    <div className="p-6 space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <PhoneCall className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Call Logs</h2>
            <p className="text-xs text-gray-400 mt-0.5">{formattedData.length} total records</p>
          </div>
>>>>>>> projects-ui:client/src/components/components-ghl/CallCenter/DownloadContact.jsx
        </div>

        <button
          onClick={downloadCSV}
          disabled={isDownloading || filteredData.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Downloading…</>
            : <><Download className="w-3.5 h-3.5" />Export CSV</>
          }
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transcripts, ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Status */}
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="all">All Statuses</option>
              <option value="ended">Ended</option>
              <option value="in-progress">In Progress</option>
            </select>
            <ChevronDownIcon />
          </div>

          {/* Type */}
          <div className="relative">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
              <option value="all">All Types</option>
              <option value="web">Web Call</option>
              <option value="phone">Phone Call</option>
            </select>
            <ChevronDownIcon />
          </div>

          {/* Date range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((d) => ({ ...d, start: e.target.value }))}
              className="flex-1 px-2 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((d) => ({ ...d, end: e.target.value }))}
              className="flex-1 px-2 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {logsError && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm">
          {logsError}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Table header row */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Call Records</span>
          <span className="text-[11px] text-gray-400">
            {filteredData.length} of {formattedData.length} records
          </span>
        </div>

        {fetchingLogs ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <p className="text-sm text-gray-400">Loading call logs…</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PhoneCall className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {formattedData.length === 0 ? "No call logs found" : "No results match your filters"}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Scrollable table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[900px]">
                <thead>
                  <tr className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
                    {["Timestamp", "Type", "Duration", "Status", "End Reason", "Transcript Preview", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {currentData.map((call, idx) => (
                      <motion.tr
                        key={call.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15, delay: idx * 0.03 }}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-indigo-50/30 transition-colors group"
                      >
                        {/* Timestamp */}
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-medium text-gray-800">{call.timestamp}</p>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <TypeBadge type={call.type} />
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-semibold text-gray-700 tabular-nums">{call.duration}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={call.status} />
                        </td>

                        {/* End Reason */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-gray-500">{call.endReason}</span>
                        </td>

                        {/* Transcript */}
                        <td className="px-4 py-3.5 max-w-[260px]">
                          <p className="text-xs text-gray-400 truncate" title={call.transcript}>
                            {call.transcript.substring(0, 90)}{call.transcript.length > 90 ? "…" : ""}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => call.recordingUrl && window.open(call.recordingUrl, "_blank")}
                              disabled={!call.recordingUrl}
                              title="Listen to recording"
                              className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 disabled:opacity-30 transition-colors"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedCall(call)}
                              title="View call details"
                              className="p-1.5 rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Call details modal ── */}
      <AnimatePresence>
        {selectedCall && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedCall(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Call Details</h3>
                    <p className="text-[11px] text-gray-400">{selectedCall.timestamp}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCall(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Type",     value: selectedCall.type },
                    { label: "Duration", value: selectedCall.duration },
                    { label: "Status",   value: selectedCall.status },
                    { label: "End Reason", value: selectedCall.endReason },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{m.label}</p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5 truncate" title={m.value}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Recording */}
                {selectedCall.recordingUrl && (
                  <a
                    href={selectedCall.recordingUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Play recording
                  </a>
                )}

                {/* Summary */}
                {selectedCall.summary && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Summary
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{selectedCall.summary}</p>
                  </div>
                )}

                {/* Transcript */}
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Transcript</p>
                  <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-3 max-h-72 overflow-y-auto">
                    {selectedCall.transcript}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                <button onClick={() => setSelectedCall(null)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallList;
