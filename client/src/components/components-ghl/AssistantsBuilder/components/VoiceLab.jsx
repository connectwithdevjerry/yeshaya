import React, { useEffect, useRef, useState } from "react";
import { Info, Loader2, Wallet } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { getAssistantIdFromUrl } from "../../../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchWalletBalance } from "../../../../store/slices/assistantsSlice";
import toast from "react-hot-toast";

export const VoiceLabView = () => {
  const vapiRef = useRef(null);
  const [searchParams] = useSearchParams();
  const assistantId = getAssistantIdFromUrl(searchParams);
  const chatEndRef = useRef(null);
  const dispatch = useDispatch();

  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

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

  const { walletBalance, fetchingBalance } = useSelector(
    (state) => state.assistants,
  );

  // Initial fetch of balance
  useEffect(() => {
    dispatch(fetchWalletBalance());
  }, [dispatch]);

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
      // Refresh balance after call ends to show updated amount
      dispatch(fetchWalletBalance());
    });

    vapiRef.current.on("speech-update", (update) => {
      if (update.role === "user") {
        setCurrentUserTranscript(update.transcript || "");
        if (
          update.status === "stopped" &&
          update.transcript.trim().length > 0
        ) {
          setMessages((prev) => [
            ...prev,
            { role: "User", text: update.transcript },
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

    vapiRef.current.on("error", (e) => {
      console.error(e);
      setIsConnecting(false);
      toast.error("An error occurred during the call.");
    });

    return () => vapiRef.current?.stop();
  }, [assistantId, dispatch]);

  const handleToggleCall = async () => {
    if (!isCallActive) {
      try {
        setIsConnecting(true);
        const balance = await dispatch(fetchWalletBalance()).unwrap();
        if (balance < 0) {
          setIsConnecting(false);
          toast.error("Call blocked: Due to insufficient balance.");
          setMessages((prev) => [
            ...prev,
            {
              role: "System",
              text: `Insufficient balance ($${Number(balance).toFixed(2)}). Please top up to use the Voice Lab.`,
            },
          ]);
          return;
        }
        await vapiRef.current.start(assistantId);
      } catch (error) {
        setIsConnecting(false);
        toast.error("Failed to verify account status.");
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
        <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              ></span>
              <span className="text-sm font-medium text-gray-700">
                {assistantName}
              </span>
            </div>

            {/* Wallet Balance Display */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                walletBalance < 0
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-gray-50 text-gray-600 border-gray-100"
              }`}
            >
              <Wallet size={12} />
              {fetchingBalance ? "..." : `$${Number(walletBalance).toFixed(2)}`}
            </div>
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
            {isConnecting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isConnecting
              ? isCallActive
                ? "Ending..."
                : "Connecting..."
              : isCallActive
                ? "End Call"
                : "Start Call"}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto bg-[#fafafa]">
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
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0 shadow-sm">
                  {msg.role === "AI" ? "AI" : "You"}
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.role === "AI"
                    ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    : msg.role === "User"
                      ? "bg-[#2563eb] text-white rounded-tr-none"
                      : "bg-yellow-50 text-yellow-800 border border-yellow-100 text-xs"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Current Live AI Speech */}
          {currentAITranscript && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                AI
              </div>
              <div className="max-w-[70%] p-3 rounded-2xl text-sm shadow-sm bg-white text-gray-800 rounded-tl-none border border-gray-100 opacity-60">
                {currentAITranscript}
              </div>
            </div>
          )}

          {/* Current Live User Speech */}
          {currentUserTranscript && (
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
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
