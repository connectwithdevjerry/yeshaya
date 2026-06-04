// src/components/assistant/CalendarModal.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X, Calendar as CalendarIcon, ExternalLink,
  Trash2, RefreshCw, Loader2, CheckCircle2, AlertTriangle, Plug,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchGHLCalendars,
  addCalendarToAssistant,
  fetchConnectedCalendar,
} from "../../../../../store/slices/assistantsSlice";
import { authorizeGoHighLevel } from "../../../../../store/slices/integrationSlice";
import toast from "react-hot-toast";
import { getAssistantIdFromUrl, getSubaccountIdFromUrl } from "../../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

export const CalendarModal = ({ isOpen, onClose }) => {
  const dispatch       = useDispatch();
  const [searchParams] = useSearchParams();
  const [processingId, setProcessingId] = useState(null);

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [reconnecting, setReconnecting] = useState(false);

  const {
    availableCalendars = [],
    fetchingCalendars,
    selectedAssistant,
    connectedCalendar,
    fetchingConnectedCalendar,
    calendarReconnectRequired,
  } = useSelector((s) => s.assistants);

  const handleReconnect = async () => {
    if (!subaccountId) { toast.error("Sub-account not found"); return; }
    setReconnecting(true);
    try {
      await dispatch(authorizeGoHighLevel({
        accountId:        subaccountId,
        accountType:      "Company",
        installationType: "directInstallation",
      })).unwrap();
      // authorizeGoHighLevel redirects the browser to GHL OAuth on success
    } catch (err) {
      toast.error(err?.message || err || "Failed to start reconnection");
      setReconnecting(false);
    }
  };

  useEffect(() => {
    if (isOpen && subaccountId && assistantId) {
      dispatch(fetchGHLCalendars(subaccountId));
      dispatch(fetchConnectedCalendar({ accountId: subaccountId, assistantId }));
    }
  }, [isOpen, subaccountId, assistantId, dispatch]);

  const handleSelectCalendar = async (calendarId) => {
    if (!assistantId) { toast.error("Assistant ID not found"); return; }
    setProcessingId(calendarId);
    try {
      await dispatch(addCalendarToAssistant({ assistantId, accountId: subaccountId, calendarId })).unwrap();
      toast.success("Calendar linked successfully");
      await dispatch(fetchConnectedCalendar({ accountId: subaccountId, assistantId })).unwrap();
    } catch (err) {
      toast.error(err || "Failed to link calendar");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSync = () => {
    dispatch(fetchGHLCalendars(subaccountId));
    dispatch(fetchConnectedCalendar({ accountId: subaccountId, assistantId }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Calendars</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedAssistant?.name
                      ? `Managing calendars for ${selectedAssistant.name}`
                      : "Manage and sync your booking calendars"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/40">
              {calendarReconnectRequired ? (
                <div className="h-full flex flex-col items-center justify-center gap-5 text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="max-w-sm">
                    <h3 className="text-base font-bold text-gray-900">GoHighLevel connection expired</h3>
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                      This sub-account's GoHighLevel connection has expired or was never completed,
                      so calendars can't be loaded. Reconnect to restore booking and calendar access.
                    </p>
                  </div>
                  <button
                    onClick={handleReconnect}
                    disabled={reconnecting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-md shadow-indigo-500/25 hover:brightness-110 transition-all disabled:opacity-60"
                  >
                    {reconnecting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
                      : <><Plug className="w-4 h-4" /> Reconnect GoHighLevel</>}
                  </button>
                  <p className="text-[11px] text-gray-400 max-w-xs">
                    You'll be taken to GoHighLevel to re-authorize, then returned here.
                  </p>
                </div>
              ) : fetchingCalendars || (fetchingConnectedCalendar && !availableCalendars.length) ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  <p className="text-sm text-gray-400 font-medium">Loading calendars…</p>
                </div>
              ) : availableCalendars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCalendars.map((cal) => {
                    const isConnected  = connectedCalendar?.calendar?.id === cal.id;
                    const isLinkingThis = processingId === cal.id;

                    return (
                      <motion.div
                        key={cal.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col p-5 rounded-2xl border-2 transition-all duration-200 relative bg-white ${
                          isConnected
                            ? "border-indigo-300 ring-4 ring-indigo-500/10 shadow-md"
                            : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                        }`}
                      >
                        {/* Connected badge */}
                        {isConnected && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wide shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Connected
                          </div>
                        )}

                        {/* Calendar info */}
                        <div className="flex items-start gap-3 mb-5">
                          <div className={`p-2.5 rounded-xl flex-shrink-0 ${isConnected ? "bg-indigo-50" : "bg-gray-50"}`}>
                            <CalendarIcon className={`w-5 h-5 ${isConnected ? "text-indigo-500" : "text-gray-400"}`} />
                          </div>
                          <div className="min-w-0 pr-16">
                            <h3 className="font-bold text-sm text-gray-900 truncate leading-tight mb-0.5">{cal.name}</h3>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tight truncate">{cal.id}</p>
                            <a
                              href={`https://link.growthtools.com/widget/booking/${cal.widgetSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs font-semibold text-indigo-500 mt-2 hover:text-indigo-700 transition-colors w-fit"
                            >
                              Booking Page <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto flex items-center gap-2">
                          <button className="p-2 border border-rose-100 rounded-xl text-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => !isConnected && handleSelectCalendar(cal.id)}
                            disabled={!!processingId || isConnected}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              isConnected
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white cursor-default shadow-sm"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 active:scale-95 disabled:opacity-50"
                            }`}
                          >
                            {isLinkingThis
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : isConnected ? "Active Calendar" : "Select Calendar"
                            }
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">No Calendars Found</p>
                    <p className="text-xs text-gray-400 mt-0.5">No calendars available for this subaccount.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 flex justify-end bg-white flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSync}
                disabled={fetchingCalendars || !!processingId || !subaccountId}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingCalendars ? "animate-spin" : ""}`} />
                Sync Calendars
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
