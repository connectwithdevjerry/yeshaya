// src/components/.../Sidebar/FindReplacePanel.jsx
import React, { useMemo, useState } from "react";
import { Search, Replace, CaseSensitive, WholeWord, Repeat } from "lucide-react";
import toast from "react-hot-toast";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRegex = (find, { caseSensitive, wholeWord }, global = true) => {
  if (!find) return null;
  let pattern = escapeRegex(find);
  if (wholeWord) pattern = `\\b${pattern}\\b`;
  const flags = `${global ? "g" : ""}${caseSensitive ? "" : "i"}`;
  try { return new RegExp(pattern, flags); } catch { return null; }
};

export const FindReplacePanel = ({ promptContent = "", setPromptContent }) => {
  const [find, setFind]       = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord]         = useState(false);

  const matchCount = useMemo(() => {
    const re = buildRegex(find, { caseSensitive, wholeWord });
    if (!re || !promptContent) return 0;
    return (promptContent.match(re) || []).length;
  }, [find, promptContent, caseSensitive, wholeWord]);

  const replaceAll = () => {
    const re = buildRegex(find, { caseSensitive, wholeWord });
    if (!re) { toast.error("Enter text to find"); return; }
    if (matchCount === 0) { toast.error("No matches"); return; }
    setPromptContent(promptContent.replace(re, replace));
    toast.success(`Replaced ${matchCount} match${matchCount > 1 ? "es" : ""}`);
  };

  const replaceFirst = () => {
    const re = buildRegex(find, { caseSensitive, wholeWord }, false);
    if (!re) { toast.error("Enter text to find"); return; }
    if (!re.test(promptContent)) { toast.error("No matches"); return; }
    setPromptContent(promptContent.replace(re, replace));
    toast.success("Replaced first match");
  };

  const ToggleChip = ({ active, onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
        active ? "border-indigo-300 bg-indigo-50 text-indigo-600" : "border-gray-200 text-gray-400 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-3 h-3" /> {label}
    </button>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Search className="w-4 h-4 text-indigo-500" />
        <div>
          <p className="text-xs font-bold text-gray-700">Find &amp; Replace</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Edit the system prompt text.</p>
        </div>
      </div>

      {/* Find */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Find</label>
        <div className="relative">
          <input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Text to find…"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          {find && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-gray-400">
              {matchCount} match{matchCount !== 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-2">
        <ToggleChip active={caseSensitive} onClick={() => setCaseSensitive((v) => !v)} icon={CaseSensitive} label="Match case" />
        <ToggleChip active={wholeWord} onClick={() => setWholeWord((v) => !v)} icon={WholeWord} label="Whole word" />
      </div>

      {/* Replace */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Replace with</label>
        <input
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replacement text…"
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={replaceFirst}
          disabled={!find || matchCount === 0}
          className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <Repeat className="w-3.5 h-3.5" /> Replace
        </button>
        <button
          onClick={replaceAll}
          disabled={!find || matchCount === 0}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold hover:brightness-110 disabled:opacity-40 flex items-center justify-center gap-1.5"
        >
          <Replace className="w-3.5 h-3.5" /> Replace all
        </button>
      </div>

      <p className="text-[10px] text-gray-400 leading-relaxed">
        Changes apply to the prompt editor and save with the assistant. Use Save Changes to persist.
      </p>
    </div>
  );
};
