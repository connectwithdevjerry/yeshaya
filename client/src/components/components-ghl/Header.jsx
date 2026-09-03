import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, Link2, Bell, CornerDownLeft, X,
  Bot, Users, CalendarClock, PhoneCall, BookOpen, Smartphone, Layers, Tag, HelpCircle, Settings,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import OauthConnectionPopup from "./OauthConnection";
import { getIntegrationStatus } from "../../store/slices/integrationSlice";

// Searchable destinations
const DESTINATIONS = [
  { label: "Assistants",      route: "/assistants",  icon: Bot,          keywords: "bot ai agent" },
  { label: "Contacts",        route: "/contacts",    icon: Users,        keywords: "people crm leads" },
  { label: "Appointments",    route: "/appointments",icon: CalendarClock,keywords: "calendar booking schedule" },
  { label: "Call Center",     route: "/call",        icon: PhoneCall,    keywords: "calls logs analytics" },
  { label: "Knowledge Bases", route: "/knowledge",   icon: BookOpen,     keywords: "kb docs files faq" },
  { label: "Numbers",         route: "/numbers",     icon: Smartphone,   keywords: "phone twilio sip" },
  { label: "Number Pools",    route: "/pools",       icon: Layers,       keywords: "rotation" },
  { label: "Active Tags",     route: "/activetags",  icon: Tag,          keywords: "tag segment" },
  { label: "Help Center",     route: "/helps",       icon: HelpCircle,   keywords: "support docs guide" },
  { label: "Settings",        route: "/ghl_settings",icon: Settings,     keywords: "account profile" },
];

export function Header({ title }) {
  const [isOpen, setIsOpen]           = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [query, setQuery]             = useState("");
  const [searchOpen, setSearchOpen]   = useState(false);
  const [activeIdx, setActiveIdx]     = useState(0);
  const searchRef = useRef(null);

  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const location       = useLocation();

  const { goHighLevel, openAI, stripe } = useSelector((s) => s.integrations || {});

  useEffect(() => { dispatch(getIntegrationStatus()); }, [dispatch]);

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const togglePopup = (name) => setActivePopup((p) => (p === name ? null : name));

  // ── Connection status ──
  const ghlExpired = goHighLevel?.expiryDate && new Date(goHighLevel.expiryDate) < new Date();
  const items = [
    { name: "GoHighLevel", connected: !!goHighLevel?.connected && !ghlExpired, detail: ghlExpired ? "Token expired — reconnect" : "OAuth connection" },
    { name: "OpenAI",      connected: !!openAI?.connected, detail: openAI?.connected ? "API key valid" : (openAI?.message || "Not connected") },
    { name: "Stripe",      connected: !!stripe?.connected, detail: stripe?.presence ? "Account connected" : "Not connected" },
  ];
  const downCount = items.filter((i) => !i.connected).length;

  // ── Search ──
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DESTINATIONS.filter((d) => d.label.toLowerCase().includes(q) || (d.keywords || "").includes(q)).slice(0, 7);
  }, [query]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  const go = (route) => {
    setQuery(""); setSearchOpen(false);
    if (location.pathname === "/app") {
      const p = new URLSearchParams({
        agencyid:   searchParams.get("agencyid")   || "",
        subaccount: searchParams.get("subaccount") || "",
        allow:      searchParams.get("allow")      || "",
        myname:     searchParams.get("myname")     || "",
        myemail:    searchParams.get("myemail")    || "",
        route,
      });
      navigate(`/app?${p.toString()}`);
    } else {
      navigate(route);
    }
  };

  const onKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => (i + 1) % results.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => (i - 1 + results.length) % results.length); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[activeIdx].route); }
    else if (e.key === "Escape") { setSearchOpen(false); }
  };

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-4 relative">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>

        <div className="flex items-center gap-2">
          {/* ── Search ── */}
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Search pages…"
              className="pl-10 pr-16 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-72 placeholder:text-gray-400"
            />
            {query ? (
              <button onClick={() => { setQuery(""); setSearchOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded-md px-1.5 py-0.5">
                Esc
              </kbd>
            )}

            <AnimatePresence>
              {searchOpen && query.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/60 z-50 overflow-hidden"
                >
                  <div className="px-3 pt-2.5 pb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pages</span>
                  </div>
                  {results.length === 0 ? (
                    <p className="px-4 py-4 text-xs text-gray-400">No matches for "<span className="text-gray-600 font-medium">{query}</span>"</p>
                  ) : (
                    <div className="px-1.5 pb-2 space-y-0.5">
                      {results.map((r, i) => {
                        const RIcon = r.icon;
                        const active = i === activeIdx;
                        return (
                          <button key={r.route} onMouseEnter={() => setActiveIdx(i)} onClick={() => go(r.route)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}>
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? "bg-indigo-100" : "bg-gray-100"}`}>
                              <RIcon className={`w-3.5 h-3.5 ${active ? "text-indigo-600" : "text-gray-500"}`} />
                            </div>
                            <span className="flex-1 text-left font-medium">{r.label}</span>
                            {active && <CornerDownLeft className="w-3 h-3 text-indigo-400" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-100 rounded">↑</kbd><kbd className="px-1 bg-gray-100 rounded">↓</kbd> navigate</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-100 rounded">↵</kbd> open</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── OAuth connection ── */}
          <button
            className={`p-2.5 rounded-xl transition-all relative ${downCount ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"}`}
            onClick={() => togglePopup("oauth")}
            title="Integration connections"
          >
            <Link2 className="w-5 h-5" />
            {downCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full">{downCount}</span>
            )}
          </button>

          {/* ── Notifications ── */}
          <button
            className="relative p-2.5 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* OAuth popup */}
      <AnimatePresence>
        {activePopup === "oauth" && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setActivePopup(null)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }} className="absolute right-16 top-full mt-2 z-50"
            >
              <OauthConnectionPopup
                items={items}
                onRefresh={() => dispatch(getIntegrationStatus())}
                onClose={() => setActivePopup(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full right-4 mt-2 z-50 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <p className="text-sm">You're all caught up 🥳</p>
              </div>
              <div className="flex justify-end p-3 border-t border-gray-100 bg-gray-50/60">
                <button onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
