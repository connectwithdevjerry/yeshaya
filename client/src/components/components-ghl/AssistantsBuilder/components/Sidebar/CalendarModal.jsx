import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Calendar as CalendarIcon,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  fetchGHLCalendars,
  addCalendarToAssistant,
  fetchConnectedCalendar,
} from "../../../../../store/slices/assistantsSlice";
import toast from "react-hot-toast";
import {
  getAssistantIdFromUrl,
  getSubaccountIdFromUrl,
} from "../../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

export const CalendarModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [processingId, setProcessingId] = useState(null);

  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  const {
    availableCalendars = [],
    fetchingCalendars,
    selectedAssistant,
    connectedCalendar, 
    fetchingConnectedCalendar,
  } = useSelector((state) => state.assistants);

  useEffect(() => {
    if (isOpen && subaccountId && assistantId) {
      dispatch(fetchGHLCalendars(subaccountId));
      dispatch(
        fetchConnectedCalendar({ accountId: subaccountId, assistantId }),
      );
    }
  }, [isOpen, subaccountId, assistantId, dispatch]);

  const handleSelectCalendar = async (calendarId) => {
    if (!assistantId) {
      toast.error("Assistant ID not found in URL");
      return;
    }

    setProcessingId(calendarId);
    try {
      await dispatch(
        addCalendarToAssistant({
          assistantId: assistantId,
          accountId: subaccountId,
          calendarId: calendarId,
        }),
      ).unwrap();

      toast.success("Calendar linked successfully");

      // ✅ Refresh the state so the new ID becomes the 'connectedCalendar'
      await dispatch(
        fetchConnectedCalendar({ accountId: subaccountId, assistantId }),
      ).unwrap();
    } catch (error) {
      toast.error(error || "Failed to link calendar");
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden transition-all duration-300">
        {/* Header Section */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Calendars
            </h2>
            <p className="text-sm text-gray-500">
              {selectedAssistant?.name
                ? `Manage calendars for ${selectedAssistant.name}`
                : "Manage and sync your connected booking calendars"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all border border-transparent hover:border-gray-200"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#fafafa]">
          {fetchingCalendars ||
          (fetchingConnectedCalendar && !availableCalendars.length) ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-medium">
                Loading calendar details...
              </p>
            </div>
          ) : availableCalendars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCalendars.map((cal) => {
                // 🔹 MATCHING LOGIC
                // We compare the ID from the list (cal.id)
                // against the nested ID in the response (connectedCalendar.calendar.id)
                const isConnected = connectedCalendar?.calendar?.id === cal.id;
                const isLinkingThis = processingId === cal.id;

                return (
                  <div
                    key={cal.id}
                    className={`flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 relative ${
                      isConnected
                        ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/10 shadow-md"
                        : "border-white bg-white hover:border-gray-200"
                    }`}
                  >
                    {isConnected && (
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
                        <CheckCircle2 size={12} /> Connected
                      </div>
                    )}

                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`p-3 rounded-xl shrink-0 ${isConnected ? "bg-blue-100" : "bg-gray-50"}`}
                      >
                        <CalendarIcon
                          className={`w-6 h-6 ${isConnected ? "text-blue-600" : "text-gray-400"}`}
                        />
                      </div>
                      <div className="min-w-0 pr-16">
                        <h3 className="font-bold text-[15px] text-gray-900 truncate leading-tight mb-1">
                          {cal.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-mono tracking-tighter truncate">
                          {cal.id}
                        </p>
                        <a
                          href={`https://link.growthtools.com/widget/booking/${cal.widgetSlug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 mt-3 hover:underline w-fit"
                        >
                          Booking Page <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2">
                      <button className="p-2.5 border border-red-100 rounded-xl text-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          !isConnected && handleSelectCalendar(cal.id)
                        }
                        disabled={!!processingId || isConnected}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-2 ${
                          isConnected
                            ? "bg-blue-600 text-white cursor-default"
                            : "bg-white border border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 shadow-sm active:scale-95 disabled:opacity-50"
                        }`}
                      >
                        {isLinkingThis ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : isConnected ? (
                          "Active Calendar"
                        ) : (
                          "Select Calendar"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <CalendarIcon className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Calendars Found
              </h3>
              <p className="text-gray-500 max-w-xs">
                No calendars found for this subaccount.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex justify-end bg-white gap-3">
          <button
            onClick={() => {
              dispatch(fetchGHLCalendars(subaccountId));
              dispatch(
                fetchConnectedCalendar({
                  accountId: subaccountId,
                  assistantId,
                }),
              );
            }}
            className="flex items-center gap-3 bg-[#0f172a] text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            disabled={fetchingCalendars || !!processingId || !subaccountId}
          >
            <RefreshCw
              size={18}
              className={fetchingCalendars ? "animate-spin" : ""}
            />
            Sync Calendars
          </button>
        </div>
      </div>
    </div>
  );
};
