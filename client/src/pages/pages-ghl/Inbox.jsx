// src/pages/pages-ghl/Inbox.jsx
import React from "react";
import { Search, MessageCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const ChatDashboard = () => {
  const conversations = [
    { id: 1, name: "John Doe", lastMessage: "Hey there!" },
  ];

  return (
    <div className="flex h-[calc(100vh-56px)] bg-gray-50/60 text-gray-800">

      {/* ── Conversation sidebar ── */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all duration-200">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search conversations…"
              className="w-full outline-none text-sm bg-transparent placeholder-gray-400"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              whileHover={{ backgroundColor: "#f5f3ff" }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {conv.name.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{conv.name}</p>
                <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination footer */}
        <div className="border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400 flex items-center justify-between">
          <span>Showing 1–{conversations.length}</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">&lt;</button>
            <button className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">&gt;</button>
          </div>
        </div>
      </aside>

      {/* ── Main area — no conversation selected ── */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-base mb-1">No conversation selected</p>
            <p className="text-gray-400 text-sm">Select a conversation from the sidebar to view it here.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ChatDashboard;
