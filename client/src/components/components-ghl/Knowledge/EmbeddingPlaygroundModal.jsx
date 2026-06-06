import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { X, Search, Loader2, FlaskConical, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { searchKnowledgeBase } from "../../../store/slices/assistantsSlice";

// Highlight query terms within a snippet
const Highlighted = ({ text, query }) => {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        terms.includes(p.toLowerCase())
          ? <mark key={i} className="bg-indigo-100 text-indigo-700 rounded px-0.5">{p}</mark>
          : <React.Fragment key={i}>{p}</React.Fragment>,
      )}
    </>
  );
};

const EmbeddingPlaygroundModal = ({ isOpen, onClose, toolId, knowledgeBaseName = "Knowledge base" }) => {
  const dispatch = useDispatch();
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [note, setNote]         = useState("");

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) { toast.error("Enter a question or keywords"); return; }
    if (!toolId) { toast.error("No knowledge base selected"); return; }
    setLoading(true); setSearched(true); setNote("");
    try {
      const res = await dispatch(searchKnowledgeBase({ toolId, query: query.trim() })).unwrap();
      setResults(res.results || []);
      setNote(res.message || "");
    } catch (err) {
      toast.error(err || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Embedding Playground</h2>
              <p className="text-xs text-gray-400">{knowledgeBaseName} — test what this knowledge base returns</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
              placeholder="Ask a question, e.g. 'What are your refund terms?'"
              className="w-full pl-10 pr-28 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold hover:brightness-110 disabled:opacity-60 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-grow bg-gray-50/40 px-6 py-5 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-indigo-400" />
              <p className="text-sm text-gray-400">Searching the knowledge base…</p>
            </div>
          ) : !searched ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-indigo-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Test your knowledge base</p>
              <p className="text-xs text-gray-400 max-w-sm">Type a question above to see the passages this knowledge base would surface to the assistant.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No matching passages</p>
              <p className="text-xs text-gray-400 max-w-sm">{note || "Try different keywords — the assistant may not have this information."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">{results.length} passage{results.length > 1 ? "s" : ""} matched, ranked by relevance:</p>
              {results.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Match #{i + 1}</span>
                    <span className="text-[10px] text-gray-300">relevance {r.score}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    <Highlighted text={r.snippet} query={query} />
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-between items-center">
          <span className="text-[11px] text-gray-400">Searches the stored text of this knowledge base.</span>
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmbeddingPlaygroundModal;
