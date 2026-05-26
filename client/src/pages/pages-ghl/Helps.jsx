// src/pages/pages-ghl/Helps.jsx
import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  "All Articles", "General", "Bots", "Chat", "Voice",
  "Knowledge", "Active Tags", "Numbers", "Integrations",
];

const ARTICLES = [
  {
    title:    "Voice AI Best Practices",
    subtitle: "How to get the most out of your voice AI with best practices, tips & tricks and recommended configurations.",
    tag:      "Voice",
    level:    "Intermediate",
    image:    "https://i.imgur.com/8zIkx1R.png",
  },
  {
    title:    "How to Use Custom Tools",
    subtitle: "Custom tools are a powerful way to connect your voice and chat AI to 3rd party systems — this doc covers how to use them.",
    tag:      "Bots",
    level:    "Advanced",
    image:    "https://i.imgur.com/bhZpYB7.png",
  },
  {
    title:    "Importing Numbers",
    subtitle: "Guide on how to import a number from any telephony system using SIP trunking — example uses Twilio.",
    tag:      "Numbers",
    level:    "Intermediate",
    image:    "https://i.imgur.com/9QZ2Cmt.png",
  },
  {
    title:    "Knowledge Base Guide",
    subtitle: "A comprehensive guide on understanding knowledge bases and best practices for getting the most out of them.",
    tag:      "Knowledge",
    level:    "Beginner",
    image:    "https://i.imgur.com/Y0lFfrW.png",
  },
  {
    title:    "Calendar Debugging Guide",
    subtitle: "Comprehensive guide on debugging / triaging calendar booking issues and fixing user configurations.",
    tag:      "General",
    level:    "Beginner",
    image:    "https://i.imgur.com/dG8nTgb.png",
  },
];

const LEVEL_COLORS = {
  Beginner:     "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced:     "bg-red-100 text-red-700",
};

const TAG_COLORS = {
  Voice:       "bg-indigo-100 text-indigo-700",
  Bots:        "bg-violet-100 text-violet-700",
  Numbers:     "bg-blue-100 text-blue-700",
  Knowledge:   "bg-teal-100 text-teal-700",
  General:     "bg-gray-100 text-gray-600",
  Chat:        "bg-pink-100 text-pink-700",
  Integrations:"bg-orange-100 text-orange-700",
};

const Helps = () => {
  const [activeCategory, setActiveCategory] = useState("All Articles");
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCategory === "All Articles" || a.tag === activeCategory;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.subtitle.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ── Hero header ── */}
      <header
        className="relative overflow-hidden text-center py-14 px-6"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.06) 1.5px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-300 font-medium mb-4 border border-white/10">
            <Sparkles className="w-3 h-3" /> Help Center
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">How can we help you?</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            Explore our documentation by asking a question or using the search below.
          </p>

          {/* Search */}
          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ask a question or search…"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/10 text-white placeholder-slate-400 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/60 backdrop-blur-sm transition-all duration-200"
            />
          </div>

          {/* Popular tags */}
          <div className="flex justify-center gap-2 mt-5 flex-wrap">
            {["Not booking", "Prompt guide", "No active tag"].map(t => (
              <span key={t} className="bg-white/10 border border-white/10 text-slate-300 text-xs px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </header>

      {/* ── Category tabs ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-1 overflow-x-auto">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.12 }}
                  className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150
                    ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
                >
                  {cat}
                  {isActive && (
                    <motion.span
                      layoutId="helpCategoryUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
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
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Search className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-gray-500 font-medium">No articles found</p>
            <p className="text-gray-400 text-sm">Try a different search term or category.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {filtered.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12)" }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200"
              >
                <img src={a.image} alt={a.title} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[a.tag] || "bg-gray-100 text-gray-600"}`}>
                      {a.tag}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[a.level] || "bg-gray-100 text-gray-600"}`}>
                      {a.level}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-snug">{a.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{a.subtitle}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Helps;
