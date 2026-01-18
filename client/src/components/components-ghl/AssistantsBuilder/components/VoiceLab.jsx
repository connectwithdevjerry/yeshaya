import React, { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

export const VoiceLabView = () => {
  const vapiRef = useRef(null);
  const [searchParams] = useSearchParams();
  const assistantId = getAssistantIdFromUrl(searchParams);

  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "AI",
      text: 'Hello! Click "Start Call" to begin the conversation.',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const assistantName = useSelector(
    (state) => state.assistants?.selectedAssistant?.name || "Assistant",
  );

  useEffect(() => {
    vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

    /** Call lifecycle */
    vapiRef.current.on("call-start", () => {
      setIsCallActive(true);
      addMessage("AI", "Connecting...");
    });

    vapiRef.current.on("call-end", () => {
      setIsCallActive(false);
      setIsThinking(false);
    });

    /** User speech → text (NO thinking here) */
    vapiRef.current.on("transcript", (t) => {
      if (t.role === "user" && t.text) {
        addMessage("User", t.text);
      }
    });

    /** Assistant started speaking */
    vapiRef.current.on("assistant-speaking", () => {
      setIsThinking(true);
    });

    /** Assistant finished speaking */
    vapiRef.current.on("assistant-stopped-speaking", () => {
      setIsThinking(false);
    });

    /** Assistant final text (AFTER speaking ends) */
    vapiRef.current.on("assistant-message", (msg) => {
      if (msg?.content) {
        addMessage("AI", msg.content);
      }
    });

    vapiRef.current.on("error", console.error);

    return () => {
      vapiRef.current?.stop();
    };
  }, []);

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const handleToggleCall = async () => {
    if (!isCallActive) {
      await vapiRef.current.start(assistantId);
    } else {
      vapiRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#f8f9fa] p-6 relative">
      {/* Warning Banner */}
      <div className="w-full p-2 mb-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center">
        <span className="font-medium flex items-center text-sm">
          <Info className="w-4 h-4 mr-2" />
          Labs do not call tools or book appointments
        </span>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-50">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></span>
            <span className="text-sm font-medium text-gray-700">{assistantName}</span>
          </div>

          <button
            onClick={handleToggleCall}
            className={`px-5 py-1.5 rounded-md font-bold text-sm transition-all shadow-sm ${
              isCallActive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isCallActive ? "End Call" : "Start Call"}
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === "User" ? "flex-row-reverse" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                {msg.role === "AI" ? "AI" : "You"}
              </div>

              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "AI"
                    ? "bg-[#f1f3f4] text-gray-800 rounded-tl-none"
                    : "bg-[#2563eb] text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* AI thinking indicator */}
          {isCallActive && isThinking && (
            <div className="flex items-center gap-1 pl-11">
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
