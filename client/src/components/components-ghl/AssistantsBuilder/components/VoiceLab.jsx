import React, { useEffect, useRef, useState } from "react";
import { Info, Loader2 } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

export const VoiceLabView = () => {
  const vapiRef = useRef(null);
  const [searchParams] = useSearchParams();
  const assistantId = getAssistantIdFromUrl(searchParams);
  const chatEndRef = useRef(null);

  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // New loading state

  const [messages, setMessages] = useState([
    {
      role: "System",
      text: 'Hello! Click "Start Call" to begin the conversation.',
    },
  ]);

  const [currentUserTranscript, setCurrentUserTranscript] = useState("");
  const [currentAITranscript, setCurrentAITranscript] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const assistantName = useSelector(
    (state) => state.assistants?.selectedAssistant?.name || "Assistant",
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUserTranscript, currentAITranscript]);

  useEffect(() => {
    vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

    vapiRef.current.on("call-start", () => {
      setIsCallActive(true);
      setIsConnecting(false);
      setMessages((prev) => [
        ...prev,
        { role: "System", text: "Call connected!" },
      ]);
    });

    vapiRef.current.on("call-end", () => {
      setIsCallActive(false);
      setIsConnecting(false);
      setIsThinking(false);
      setCurrentUserTranscript("");
      setCurrentAITranscript("");
      setMessages((prev) => [...prev, { role: "System", text: "Call ended." }]);
    });

    vapiRef.current.on("speech-update", (update) => {
  if (update.role === "user") {
    setCurrentUserTranscript(update.transcript || "");

    if (update.status === "stopped" && update.transcript.trim().length > 0) {
      setMessages((prev) => [
        ...prev, 
        { role: "User", text: update.transcript }
      ]);

      setCurrentUserTranscript("");
    }
  }
});

    vapiRef.current.on("message", (msg) => {
      if (msg.type === "transcript" && msg.role === "assistant") {
        if (msg.transcriptType === "partial") {
          setCurrentAITranscript(msg.transcript);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "AI", text: msg.transcript },
          ]);
          setCurrentAITranscript("");
        }
      }
    });

    vapiRef.current.on("assistant-message", (msg) => {
      if (msg?.content && !currentAITranscript) {
        setMessages((prev) => [...prev, { role: "AI", text: msg.content }]);
      }
    });
    
    vapiRef.current.on("error", (e) => {
      console.error(e);
      setIsConnecting(false);
    });

    return () => vapiRef.current?.stop();
  }, [assistantId]);

  const handleToggleCall = async () => {
    if (!isCallActive) {
      try {
        setIsConnecting(true); // Start loading
        await vapiRef.current.start(assistantId);
      } catch (error) {
        setIsConnecting(false);
        setMessages((prev) => [
          ...prev,
          { role: "System", text: "Connection failed." },
        ]);
      }
    } else {
      setIsConnecting(true);
      vapiRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#f8f9fa] p-6 relative">
      <div className="w-full p-2 mb-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center text-sm font-medium">
        <Info className="w-4 h-4 mr-2" />
        Labs do not call tools or book appointments
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-50">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            ></span>
            <span className="text-sm font-medium text-gray-700">
              {assistantName}
            </span>
          </div>

          <button
            onClick={handleToggleCall}
            disabled={isConnecting} 
            className={`flex items-center justify-center min-w-[120px] px-5 py-1.5 rounded-md font-bold text-sm transition-all shadow-sm ${
              isCallActive
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-green-500 text-white hover:bg-green-600"
            } disabled:opacity-70`}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {isConnecting
              ? isCallActive
                ? "Ending..."
                : "Connecting..."
              : isCallActive
                ? "End Call"
                : "Start Call"}
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
          {/* History of messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === "User"
                  ? "flex-row-reverse"
                  : msg.role === "System"
                    ? "justify-center"
                    : ""
              }`}
            >
              {msg.role !== "System" && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                  {msg.role === "AI" ? "AI" : "You"}
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "AI"
                    ? "bg-[#f1f3f4] text-gray-800 rounded-tl-none"
                    : msg.role === "User"
                      ? "bg-[#2563eb] text-white rounded-tr-none"
                      : "bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Current Live AI Speech (Temporary) */}
          {currentAITranscript && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                AI
              </div>
              <div className="max-w-[70%] p-3 rounded-2xl text-sm shadow-sm bg-[#f1f3f4] text-gray-800 rounded-tl-none opacity-60">
                {currentAITranscript}
              </div>
            </div>
          )}

          {/* Current Live User Speech (Temporary) */}
          {currentUserTranscript && (
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                You
              </div>
              <div className="max-w-[70%] p-3 rounded-2xl text-sm shadow-sm bg-[#2563eb] text-white rounded-tr-none opacity-60 italic">
                {currentUserTranscript}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
};
