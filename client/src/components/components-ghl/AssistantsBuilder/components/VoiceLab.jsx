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
  const chatEndRef = useRef(null);

  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "System",
      text: 'Hello! Click "Start Call" to begin the conversation.',
      isComplete: true,
    },
  ]);

  const [currentUserTranscript, setCurrentUserTranscript] = useState("");
  const [currentAITranscript, setCurrentAITranscript] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const assistantName = useSelector(
    (state) => state.assistants?.selectedAssistant?.name || "Assistant"
  );

  // Helper to add to the permanent message list
  const addMessage = (role, text, isComplete = false) => {
    setMessages((prev) => [...prev, { role, text, isComplete }]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUserTranscript, currentAITranscript, isThinking]);

  useEffect(() => {
    vapiRef.current = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

    vapiRef.current.on("call-start", () => {
      setIsCallActive(true);
      addMessage("System", "Call connected! Start speaking...", true);
    });

    vapiRef.current.on("call-end", () => {
      setIsCallActive(false);
      setIsThinking(false);
      setCurrentUserTranscript("");
      setCurrentAITranscript("");
      addMessage("System", "Call ended.", true);
    });

    vapiRef.current.on("speech-update", (update) => {
      if (update.role === "user") {
        setCurrentUserTranscript(update.transcript || "");

        if (update.status === "stopped") {
          if (update.transcript) {
            // LOCK user message to history
            addMessage("User", update.transcript, true);
          }
          setCurrentUserTranscript("");
        }
      }
    });

    vapiRef.current.on("assistant-speaking", () => {
      setIsThinking(false); // Stop showing bounce dots once it starts talking
    });

    vapiRef.current.on("assistant-stopped-speaking", () => {
      setIsThinking(false);
    });

    vapiRef.current.on("message", (msg) => {
      // 1. Handle live typing for AI
      if (msg.type === "transcript" && msg.role === "assistant") {
        setCurrentAITranscript(msg.transcript || "");
      }
      
      // 2. Handle the 'thinking' state based on model-output/request
      if (msg.type === "speech-update" && msg.status === "loading") {
        setIsThinking(true);
      }
    });

    vapiRef.current.on("assistant-message", (msg) => {
      // 3. LOCK AI message to history when finished
      // This prevents the previous response from being overwritten
      if (msg?.content) {
        addMessage("AI", msg.content, true);
        setCurrentAITranscript(""); 
        setIsThinking(false);
      }
    });

    return () => {
      vapiRef.current?.stop();
    };
  }, [assistantId]);

  const handleToggleCall = async () => {
    if (!isCallActive) {
      try {
        await vapiRef.current.start(assistantId);
      } catch (error) {
        addMessage("System", "Failed to start call.", true);
      }
    } else {
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
            <span className={`w-2.5 h-2.5 rounded-full ${isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}></span>
            <span className="text-sm font-medium text-gray-700">{assistantName}</span>
          </div>
          <button
            onClick={handleToggleCall}
            className={`px-5 py-1.5 rounded-md font-bold text-sm transition-all shadow-sm ${
              isCallActive ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isCallActive ? "End Call" : "Start Call"}
          </button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
          {/* Historical Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === "User" ? "flex-row-reverse" : msg.role === "System" ? "justify-center" : ""
              }`}
            >
              {msg.role !== "System" && (
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                  {msg.role === "AI" ? "AI" : "You"}
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "AI" ? "bg-[#f1f3f4] text-gray-800 rounded-tl-none" :
                  msg.role === "User" ? "bg-[#2563eb] text-white rounded-tr-none" :
                  "bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs text-center"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Current Live User Transcription */}
          {currentUserTranscript && (
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">You</div>
              <div className="max-w-[70%] p-3 rounded-2xl text-sm shadow-sm bg-[#2563eb] text-white rounded-tr-none opacity-60 italic">
                {currentUserTranscript}
              </div>
            </div>
          )}

          {/* Current Live AI Transcription */}
          {currentAITranscript && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">AI</div>
              <div className="max-w-[70%] p-3 rounded-2xl text-sm shadow-sm bg-[#f1f3f4] text-gray-800 rounded-tl-none opacity-60">
                {currentAITranscript}
              </div>
            </div>
          )}

          {/* Thinking Bubbles (Only if AI is not yet typing words) */}
          {isCallActive && isThinking && !currentAITranscript && (
            <div className="flex items-center gap-1 pl-11">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
};