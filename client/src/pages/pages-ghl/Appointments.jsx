// src/pages/pages-ghl/Appointments.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, CalendarClock, CalendarCheck, CalendarX, Loader2,
  RefreshCw, AlertCircle, Clock, User, BarChart3,
} from "lucide-react";
import { fetchAppointments, fetchCalendarSlots, bookManualAppointment } from "../../store/slices/appointmentSlice";
import { fetchGHLCalendars } from "../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";
import { Plus, X, Check } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ─── Manual Booking Modal ─────────────────────────────────────────────────────
const BookingModal = ({ subaccountId, onClose, onBooked }) => {
  const dispatch = useDispatch();
  const { availableCalendars = [] } = useSelector((s) => s.assistants);

  const [calendarId, setCalendarId] = useState("");
  const [date, setDate]   = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotsMsg, setSlotsMsg] = useState("");
  const [slot, setSlot]   = useState("");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => { if (subaccountId) dispatch(fetchGHLCalendars(subaccountId)); }, [dispatch, subaccountId]);
  useEffect(() => { if (availableCalendars.length && !calendarId) setCalendarId(availableCalendars[0].id); }, [availableCalendars]);

  useEffect(() => {
    if (!calendarId || !date) return;
    setLoadingSlots(true); setSlot(""); setSlots([]); setSlotsMsg("");
    dispatch(fetchCalendarSlots({ subaccountId, calendarId, date })).unwrap()
      .then((res) => { setSlots(res.slots || []); if (res.unavailable) setSlotsMsg(res.message || ""); })
      .catch((e) => { setSlotsMsg(e || "Failed to load slots"); })
      .finally(() => setLoadingSlots(false));
  }, [dispatch, subaccountId, calendarId, date]);

  const handleBook = async () => {
    if (!slot) { toast.error("Pick a time slot"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Enter a valid customer email"); return; }
    setBooking(true);
    try {
      await dispatch(bookManualAppointment({ subaccountId, calendarId, customerName: name, customerEmail: email, startTime: slot })).unwrap();
      toast.success("Appointment booked");
      onBooked();
      onClose();
    } catch (err) { toast.error(err || "Failed to book"); }
    finally { setBooking(false); }
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
          onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[88vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center"><CalendarClock className="w-4 h-4 text-indigo-500" /></div>
              <div><h3 className="text-sm font-semibold text-gray-800">New Appointment</h3>
                <p className="text-xs text-gray-400 mt-0.5">Book on a customer's behalf</p></div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Calendar</label>
                <select value={calendarId} onChange={(e) => setCalendarId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                  {availableCalendars.length === 0 && <option value="">No calendars</option>}
                  {availableCalendars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Date</label>
                <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>

            {/* Slots */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Available Times</label>
              {loadingSlots ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">{slotsMsg || "No available slots for this day."}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {slots.map((s) => {
                    const t = new Date(s).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
                    const active = slot === s;
                    return (
                      <button key={s} onClick={() => setSlot(s)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${active ? "border-indigo-500 bg-indigo-500 text-white" : "border-gray-200 text-gray-600 hover:border-indigo-300"}`}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Customer Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">Customer Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button onClick={onClose} disabled={booking} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button onClick={handleBook} disabled={booking || !slot}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 disabled:opacity-50 flex items-center gap-2">
              {booking ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking…</> : <><Check className="w-4 h-4" /> Book Appointment</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const KpiCard = ({ icon: Icon, label, value, color, gradient, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
  >
    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <p className="text-2xl font-black text-gray-900 tabular-nums">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
  </motion.div>
);

const fmtWhen = (d) => new Date(d).toLocaleString("en-US", {
  weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
});

const Appointments = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const { appointments, metrics, loading, reconnectRequired } = useSelector((s) => s.appointments);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    if (subaccountId) dispatch(fetchAppointments(subaccountId));
  }, [dispatch, subaccountId]);

  const now = Date.now();
  const upcoming = (appointments || [])
    .filter((a) => a.status === "booked" && new Date(a.startTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const maxTrend = Math.max(1, ...((metrics?.trend || []).map((d) => d.count)));

  return (
    <div className="flex-grow bg-gray-50/40 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Appointments
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Bookings synced from your GoHighLevel calendars</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => dispatch(fetchAppointments(subaccountId))} disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition-all disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync
            </button>
            <button onClick={() => setShowBooking(true)} disabled={!subaccountId}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-50">
              <Plus className="w-3.5 h-3.5" /> New Appointment
            </button>
          </div>
        </div>

        {showBooking && (
          <BookingModal
            subaccountId={subaccountId}
            onClose={() => setShowBooking(false)}
            onBooked={() => dispatch(fetchAppointments(subaccountId))}
          />
        )}

        {reconnectRequired && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            GoHighLevel connection expired — showing stored appointments only. Reconnect to sync the latest.
          </div>
        )}

        {loading && !metrics ? (
          <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-indigo-400" /></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={CalendarClock} label="Upcoming"     value={metrics?.upcoming ?? 0}  gradient="from-indigo-500 to-violet-600" index={0} />
              <KpiCard icon={CalendarCheck} label="This Week"    value={metrics?.thisWeek ?? 0}  gradient="from-emerald-500 to-teal-600"  index={1} />
              <KpiCard icon={Calendar}      label="This Month"   value={metrics?.thisMonth ?? 0} gradient="from-blue-500 to-cyan-600"     index={2} />
              <KpiCard icon={CalendarX}     label="Cancelled"    value={metrics?.cancelled ?? 0} gradient="from-rose-500 to-pink-600"     index={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trend chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-indigo-500" /> Bookings — last 14 days
                </h3>
                <div className="flex items-end gap-1.5 h-40">
                  {(metrics?.trend || []).map((d, i) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full bg-gray-50 rounded-t-md relative flex items-end" style={{ height: "100%" }}>
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${(d.count / maxTrend) * 100}%` }}
                          transition={{ delay: i * 0.03 }}
                          className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-md min-h-[2px]"
                          title={`${d.count} on ${d.date}`}
                        />
                      </div>
                      <span className="text-[9px] text-gray-300">{d.date.slice(8)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-calendar breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">By Calendar</h3>
                {(metrics?.byCalendar || []).length === 0 ? (
                  <p className="text-xs text-gray-400">No bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {metrics.byCalendar.map((c) => {
                      const pct = metrics.total ? (c.count / metrics.total) * 100 : 0;
                      return (
                        <div key={c.name}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 truncate">{c.name}</span>
                            <span className="text-gray-400 tabular-nums">{c.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming agenda */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="text-sm font-semibold text-gray-800">Upcoming Appointments</h3>
              </div>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3"><Calendar className="w-5 h-5 text-indigo-300" /></div>
                  <p className="text-sm font-medium text-gray-500">No upcoming appointments</p>
                  <p className="text-xs text-gray-400 mt-1">New bookings from calls or GoHighLevel will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcoming.map((a, i) => (
                    <motion.div key={a._id || a.ghlEventId || i}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.customerName || a.title || "Appointment"}</p>
                        {a.customerEmail && <p className="text-xs text-gray-400 truncate">{a.customerEmail}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-gray-400" /> {fmtWhen(a.startTime)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;
