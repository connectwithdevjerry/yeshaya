// src/components/.../Sidebar/TeamNotesPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Users, Loader2, Check, AlertCircle } from "lucide-react";
import { fetchTeamNotes, saveTeamNotes } from "../../../../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl, getAssistantIdFromUrl } from "../../../../../utils/urlUtils";

export const TeamNotesPanel = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState(""); // "saving" | "saved" | "error"
  const debounceRef = useRef(null);
  const clearRef    = useRef(null);
  const initialRef  = useRef(true);

  useEffect(() => {
    if (!subaccountId || !assistantId) { setLoading(false); return; }
    setLoading(true);
    dispatch(fetchTeamNotes({ subaccountId, assistantId })).unwrap()
      .then((n) => setNotes(n || ""))
      .catch(() => {})
      .finally(() => { setLoading(false); initialRef.current = false; });
  }, [dispatch, subaccountId, assistantId]);

  const save = (value) => {
    setStatus("saving");
    dispatch(saveTeamNotes({ subaccountId, assistantId, teamNotes: value })).unwrap()
      .then(() => {
        setStatus("saved");
        clearTimeout(clearRef.current);
        clearRef.current = setTimeout(() => setStatus(""), 2000);
      })
      .catch(() => {
        setStatus("error");
        clearTimeout(clearRef.current);
        clearRef.current = setTimeout(() => setStatus(""), 4000);
      });
  };

  const onChange = (e) => {
    const v = e.target.value;
    setNotes(v);
    if (initialRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(v), 1000);
  };

  useEffect(() => () => { clearTimeout(debounceRef.current); clearTimeout(clearRef.current); }, []);

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <div>
            <p className="text-xs font-bold text-gray-700">Team Notes</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Shared, internal notes for this assistant.</p>
          </div>
        </div>
        {status === "saving" && <span className="flex items-center gap-1 text-[11px] text-indigo-500"><Loader2 className="w-3 h-3 animate-spin" /> Saving</span>}
        {status === "saved"  && <span className="flex items-center gap-1 text-[11px] text-emerald-500"><Check className="w-3 h-3" /> Saved</span>}
        {status === "error"  && <span className="flex items-center gap-1 text-[11px] text-rose-500"><AlertCircle className="w-3 h-3" /> Error</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <>
          <textarea
            value={notes}
            onChange={onChange}
            onBlur={() => { if (!initialRef.current) { clearTimeout(debounceRef.current); save(notes); } }}
            placeholder="Add notes for your team about this assistant — context, do's and don'ts, things to remember…"
            rows={12}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none resize-none leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300"
          />
          <p className="text-[10px] text-gray-400">Auto-saves as you type. Visible to your whole team.</p>
        </>
      )}
    </div>
  );
};
