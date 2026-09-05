// src/components/.../Sidebar/WorkingHoursPanel.jsx
//
// The days and times an assistant is on duty.
//
// Off by default and for every existing assistant: switching it on is what
// starts turning callers away, so nothing here changes behaviour until someone
// deliberately enables it. The hours are read on the sub-account's clock, not
// the server's, and the panel says which that is.
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Loader2, Clock, AlertCircle, CheckCircle2, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { fetchWorkingHours, saveWorkingHours } from "../../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

export const WorkingHoursPanel = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId = getAssistantIdFromUrl(searchParams);

  const [enabled, setEnabled] = useState(false);
  const [days, setDays] = useState([]);
  const [labels, setLabels] = useState([]);
  const [closedMessage, setClosedMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!subaccountId || !assistantId) return;
    setLoading(true);
    setError("");
    dispatch(fetchWorkingHours({ subaccountId, assistantId }))
      .unwrap()
      .then((d) => {
        setEnabled(d.enabled);
        setDays(d.days || []);
        setLabels(d.dayLabels || []);
        setClosedMessage(d.closedMessage || "");
        setPlaceholder(d.defaultClosedMessage || "");
        setTimezone(d.timezone || "UTC");
        setDirty(false);
      })
      .catch((e) => setError(typeof e === "string" ? e : e?.message || "Couldn't load hours"))
      .finally(() => setLoading(false));
  }, [dispatch, subaccountId, assistantId]);

  const update = (dayIndex, patch) => {
    setDays((prev) => prev.map((d) => (d.day === dayIndex ? { ...d, ...patch } : d)));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        saveWorkingHours({ subaccountId, assistantId, enabled, days, closedMessage }),
      ).unwrap();
      toast.success(enabled ? "Working hours saved" : "Working hours turned off");
      setDirty(false);
    } catch (e) {
      // The server refuses a week that would never answer, or a time it cannot
      // read. Its wording names the day, so show it rather than a generic error.
      toast.error(typeof e === "string" ? e : e?.message || "Couldn't save");
    } finally {
      setSaving(false);
    }
  };

  if (!subaccountId || !assistantId) {
    return (
      <div className="px-4 py-6 text-center">
        <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500">Open this from within an assistant.</p>
      </div>
    );
  }

  const labelFor = (i) => labels.find((l) => l.index === i)?.label || `Day ${i}`;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 flex-shrink-0">
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">Working Hours</p>
            <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
              Outside these hours the assistant won't take calls, texts or chats —
              callers hear your message instead.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => { setEnabled(!enabled); setDirty(true); }}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors mt-0.5 ${
            enabled ? "bg-indigo-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
              enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
          <p className="text-[11px] text-amber-700">{error}</p>
        </div>
      ) : (
        <>
          {!enabled && (
            <p className="text-[11px] text-gray-400 rounded-xl bg-gray-50 p-3">
              Always on. The assistant answers at any hour, any day.
            </p>
          )}

          <div className={enabled ? "" : "opacity-40 pointer-events-none"}>
            {/* Whose clock these hours are on. Without this the times are
                ambiguous, and a 9am set in the wrong zone is silently wrong. */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2">
              <Globe className="w-3 h-3" />
              Times are in <span className="font-semibold text-gray-700">{timezone}</span>
            </div>

            <div className="space-y-1.5">
              {days.map((d) => (
                <div key={d.day} className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 w-[92px] flex-shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={d.enabled !== false}
                      onChange={(e) => update(d.day, { enabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-[11px] font-medium text-gray-700 truncate">
                      {labelFor(d.day)}
                    </span>
                  </label>
                  <input
                    type="time"
                    value={d.start || ""}
                    disabled={d.enabled === false}
                    onChange={(e) => update(d.day, { start: e.target.value })}
                    className="flex-1 min-w-0 text-[11px] px-2 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-300"
                  />
                  <span className="text-[11px] text-gray-300">to</span>
                  <input
                    type="time"
                    value={d.end || ""}
                    disabled={d.enabled === false}
                    onChange={(e) => update(d.day, { end: e.target.value })}
                    className="flex-1 min-w-0 text-[11px] px-2 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-300"
                  />
                </div>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 mt-2 leading-snug">
              A closing time earlier than the opening one runs past midnight — 20:00
              to 02:00 is one evening shift.
            </p>

            <div className="mt-3 space-y-1">
              <label className="block text-[11px] font-semibold text-gray-700">
                What to say when closed
              </label>
              <textarea
                value={closedMessage}
                onChange={(e) => { setClosedMessage(e.target.value); setDirty(true); }}
                rows={2}
                maxLength={300}
                placeholder={placeholder}
                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-300 focus:outline-none resize-none"
              />
              <p className="text-[10px] text-gray-400">
                Spoken to callers and sent as the reply to texts and chats.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {dirty && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Unsaved
              </p>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                dirty
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:brightness-110"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              } disabled:opacity-70`}
            >
              {saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                : <><CheckCircle2 className="w-3.5 h-3.5" /> Save</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
