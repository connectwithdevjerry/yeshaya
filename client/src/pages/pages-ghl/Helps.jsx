// src/pages/pages-ghl/Helps.jsx
import React, { useState } from "react";
import { Search, Sparkles, X, ArrowLeft, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HELP_ARTICLES, HELP_CATEGORIES } from "../../data/helpArticles";

const LEVEL_COLORS = {
  Beginner:     "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced:     "bg-red-100 text-red-700",
};
const TAG_COLORS = {
  Voice:        "bg-indigo-100 text-indigo-700",
  Bots:         "bg-violet-100 text-violet-700",
  Numbers:      "bg-blue-100 text-blue-700",
  Knowledge:    "bg-teal-100 text-teal-700",
  General:      "bg-gray-100 text-gray-600",
  Chat:         "bg-pink-100 text-pink-700",
  Integrations: "bg-orange-100 text-orange-700",
  "Active Tags":"bg-rose-100 text-rose-700",
};

/* Render **bold** within a string */
const Inline = ({ text }) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i} className="font-semibold text-gray-800">{p.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{p}</React.Fragment>
  );
};

/* Render a single content block */
const Block = ({ block }) => {
  switch (block.type) {
    case "h2":
      return <h2 className="text-base font-bold text-gray-900 mt-5 mb-2">{block.text}</h2>;
    case "p":
      return <p className="text-sm text-gray-600 leading-relaxed mb-2"><Inline text={block.text} /></p>;
    case "ul":
      return (
        <ul className="list-disc pl-5 space-y-1 mb-3">
          {block.items.map((it, i) => <li key={i} className="text-sm text-gray-600 leading-relaxed"><Inline text={it} /></li>)}
        </ul>
      );
    case "steps":
      return (
        <ol className="list-decimal pl-5 space-y-1 mb-3">
          {block.items.map((it, i) => <li key={i} className="text-sm text-gray-600 leading-relaxed"><Inline text={it} /></li>)}
        </ol>
      );
    case "tip":
      return (
        <div className="flex gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 my-3">
          <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700 leading-relaxed"><Inline text={block.text} /></p>
        </div>
      );
    case "code":
      return <pre className="bg-gray-900 text-gray-100 rounded-xl p-3 my-3 text-xs font-mono overflow-x-auto">{block.text}</pre>;
    default:
      return null;
  }
};

const CardBanner = ({ tag }) => (
  <div className="w-full h-24 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center">
    <BookOpen className="w-8 h-8 text-white/70" />
  </div>
);

const Helps = () => {
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [search, setSearch] = useState("");
  const [openArticle, setOpenArticle] = useState(null);

  const filtered = HELP_ARTICLES.filter((a) => {
    const matchCat = activeCategory === "All Articles" || a.tag === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden text-center py-14 px-6"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.06) 1.5px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-300 font-medium mb-4 border border-white/10">
            <Sparkles className="w-3 h-3" /> Help Center
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">How can we help you?</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">Explore our documentation by searching or browsing the topics below.</p>
          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ask a question or search…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 backdrop-blur-sm transition-all duration-200" />
          </div>
          <div className="flex justify-center gap-2 mt-5 flex-wrap">
            {["booking", "knowledge base", "import number", "api keys", "reconnect"].map((t) => (
              <button key={t} onClick={() => setSearch(t)}
                className="bg-white/10 border border-white/10 text-slate-300 text-xs px-3 py-1 rounded-full hover:bg-white/20 transition-colors">
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      </header>

      {/* ── Category tabs ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-1 overflow-x-auto">
            {HELP_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button key={cat} onClick={() => setActiveCategory(cat)} whileHover={{ y: -1 }} transition={{ duration: 0.12 }}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150 ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
                  {cat}
                  {isActive && <motion.span layoutId="helpCategoryUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Articles grid ── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center"><Search className="w-7 h-7 text-indigo-400" /></div>
            <p className="text-gray-500 font-medium">No articles found</p>
            <p className="text-gray-400 text-sm">Try a different search term or category.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12)" }}
                onClick={() => setOpenArticle(a)}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200">
                <CardBanner tag={a.tag} />
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[a.tag] || "bg-gray-100 text-gray-600"}`}>{a.tag}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[a.level] || "bg-gray-100 text-gray-600"}`}>{a.level}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{a.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{a.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* ── Article detail ── */}
      <AnimatePresence>
        {openArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenArticle(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <button onClick={() => setOpenArticle(null)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button onClick={() => setOpenArticle(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[openArticle.tag] || "bg-gray-100 text-gray-600"}`}>{openArticle.tag}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[openArticle.level] || "bg-gray-100 text-gray-600"}`}>{openArticle.level}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{openArticle.title}</h1>
                <p className="text-sm text-gray-400 mb-4">{openArticle.subtitle}</p>
                <div>{(openArticle.body || []).map((b, i) => <Block key={i} block={b} />)}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Helps;
