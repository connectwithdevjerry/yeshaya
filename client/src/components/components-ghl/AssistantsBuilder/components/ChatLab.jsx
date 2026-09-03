// src/components/components-ghl/AssistantsBuilder/components/ChatLab.jsx
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Send, MessageSquare, Trash2, Info, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendChatMessage,
  fetchChatHistory,
  clearChatHistory,
} from "../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import toast from "react-hot-toast";

export const ChatLabView = () => {
  const dispatch     = useDispatch();
  const [searchParams] = useSearchParams();
  const assistantId  = getAssistantIdFromUrl(searchParams);

  const [messages,   setMessages]   = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef    = useRef(null);

  const assistantName = useSelector(
    (s) => s.assistants?.selectedAssistant?.name || "Assistant"
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Chat history lives server-side with the assistant's customer memory, so the
  // panel restores it on mount instead of starting blank while the assistant
  // still remembers the conversation.
  useEffect(() => {
    if (!assistantId) return;
    let cancelled = false;

    setLoadingHistory(true);
    dispatch(fetchChatHistory({ assistantId }))
      .unwrap()
      .then((turns) => {
        if (cancelled) return;
        setMessages(
          turns.map((t) => ({
            role: t.role,
            content: t.content,
            ...(t.role === "assistant" && { name: assistantName }),
          })),
        );
      })
      .catch(() => {
        // A history that will not load is not worth interrupting the tester
        // over — the panel just starts empty.
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => { cancelled = true; };
  }, [assistantId, dispatch, assistantName]);

  // "Clear" drops the assistant's memory of this test thread too, otherwise it
  // would keep replying with context the tester can no longer see.
  const handleClear = async () => {
    const previous = messages;
    setMessages([]);
    try {
      await dispatch(clearChatHistory({ assistantId })).unwrap();
    } catch (err) {
      setMessages(previous);
      toast.error(
        typeof err === "string" ? err : (err?.message || "Failed to clear history."),
      );
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !assistantId) return;
    const userText = inputValue;
    setMessages((p) => [...p, { role: "user", content: userText }]);
    setInputValue("");
    setMessages((p) => [...p, { role: "assistant", isLoading: true, name: assistantName }]);

    try {
      const response = await dispatch(sendChatMessage({ assistantId, userText })).unwrap();
      
      if (response.status === false) {
        throw new Error(response.message || "Failed to send message.");
      }
      
      const botReply = response.reply?.[0]?.content || "No response received.";
      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = { role: "assistant", isLoading: false, name: assistantName, content: botReply };
        return updated;
      });
    } catch (err) {
      const reason = typeof err === "string" ? err : (err?.message || "Something went wrong. Please try again.");
      toast.error(reason);
      setMessages((p) => {
        const updated = [...p];
        updated[updated.length - 1] = { role: "assistant", isLoading: false, name: assistantName, content: reason };
        return updated;
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sub-header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-semibold text-indigo-600">
            <Sparkles className="w-3 h-3" /> Live Lab Mode
          </span>
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" /> No tools or appointments
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full min-h-[300px] flex flex-col items-center justify-center gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-800">Chat Lab</p>
                <p className="text-xs text-gray-400 mt-1">
                  {loadingHistory
                    ? "Loading previous conversation…"
                    : "Test your assistant's responses below"}
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex max-w-4xl mx-auto ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-gray-400 mr-1">You</span>
                    <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm font-medium shadow-md shadow-indigo-500/15 max-w-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-1.5 max-w-[75%]">
                    <div className="flex items-center gap-2 pl-1">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{msg.name}</span>
                    </div>
                    {msg.isLoading ? (
                      <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm space-y-2.5 min-w-[180px]">
                        {[100, 80, 50].map((w, j) => (
                          <div key={j} className={`h-2 bg-gray-200 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
                        {msg.content}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message your AI…"
            className="w-full pl-4 pr-14 py-3.5 border border-gray-200 rounded-2xl text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white placeholder:text-gray-300"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 disabled:opacity-40 transition-all"
          >
            <Send className="w-3.5 h-3.5 rotate-45" />
          </motion.button>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 text-center">
          AI can make mistakes — always verify important information.
        </p>
      </div>
    </div>
  );
};
