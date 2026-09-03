// src/components/components-ghl/AssistantsBuilder/components/VoiceLab.jsx
import React, { useEffect, useRef, useState } from "react";
import { Info, Loader2, Wallet, Phone, PhoneOff, Mic, Bot, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Vapi from "@vapi-ai/web";
import { useSelector, useDispatch } from "react-redux";
import { fetchWalletBalance } from "../../../../store/slices/assistantsSlice";
import toast from "react-hot-toast";

let globalVapiInstance = null;
const getVapiInstance = () => {
  if (!globalVapiInstance) {
    globalVapiInstance = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
  }
  return globalVapiInstance;
};

const ROLE_STYLES = {
  AI:     "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm",
  User:   "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-sm",
  System: "bg-amber-50 border border-amber-100 text-amber-700 text-xs",
};

export const VoiceLabView = () => {
  const vapiRef      = useRef(null);
  const chatEndRef   = useRef(null);
  const dispatch     = useDispatch();

  const [isCallActive,        setIsCallActive]        = useState(false);
  const [isConnecting,        setIsConnecting]        = useState(false);
  const [messages,            setMessages]            = useState([
    { role: "System", text: 'Click "Start Call" to begin the conversation.' },
  ]);
  const [currentUserTranscript, setCurrentUserTranscript] = useState("");
  const [currentAITranscript,   setCurrentAITranscript]   = useState("");

  const selectedAssistant = useSelector((s) => s.assistants?.selectedAssistant);
  const assistantId   = selectedAssistant?.id;
  const assistantName = selectedAssistant?.name || "Assistant";
  const { walletBalance, fetchingBalance } = useSelector((s) => s.assistants);

  useEffect(() => { dispatch(fetchWalletBalance()); }, [dispatch]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, currentUserTranscript, currentAITranscript]);

  // Ref to track call status for safe unmounting
  const isCallActiveRef = useRef(false);
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  useEffect(() => {
    const vapi = getVapiInstance();
    vapiRef.current = vapi;

    const onCallStart = () => {
      console.log("🟢 Vapi: Call connected!");
      setIsCallActive(true);
      setIsConnecting(false);
      
      // Force microphone un-mute just in case Daily clamped it natively
      if (vapi.setMuted) {
        vapi.setMuted(false);
      }

      setMessages((prev) => [
        ...prev,
        { role: "System", text: "Call connected! Microphone active." },
      ]);
    };

    const onCallEnd = () => {
      console.log("🔴 Vapi: Call ended.");
      setIsCallActive(false);
      setIsConnecting(false);
      setCurrentUserTranscript("");
      setCurrentAITranscript("");
      setMessages((prev) => [...prev, { role: "System", text: "Call ended." }]);
      dispatch(fetchWalletBalance());
    };

    const onSpeechUpdate = (update) => {
      // console.log("🎙️ Vapi Speech Update:", update); // disabled for spam
      if (update.role === "user") {
        setCurrentUserTranscript(update.transcript || "");
        if (update.status === "stopped" && update.transcript.trim()) {
          setMessages((p) => [...p, { role: "User", text: update.transcript }]);
          setCurrentUserTranscript("");
        }
      }
    };

    const onMessage = (msg) => {
      console.log("📨 Vapi Message Received:", msg);
      // Vapi pushes all events here, including human transcriptions depending on SDK version
      if (msg.type === "transcript" && msg.role === "user") {
          // Some older VAPI SDK versions route user transcripts through standard messages
          if (msg.transcriptType === "final" && msg.transcript?.trim().length > 0) {
             setMessages((prev) => [...prev, { role: "User", text: msg.transcript }]);
          }
      }

      if (msg.type === "transcript" && msg.role === "assistant") {
        if (msg.transcriptType === "partial") {
          setCurrentAITranscript(msg.transcript);
        } else {
          setMessages((p) => [...p, { role: "AI", text: msg.transcript }]);
          setCurrentAITranscript("");
        }
      }
    };

    const onError = (e) => {
      console.error(e);
      setIsConnecting(false);
      toast.error("An error occurred during the call.");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-update", onSpeechUpdate);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => {
      // ✅ Clean up listeners properly so re-renders don't duplicate events
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-update", onSpeechUpdate);
      vapi.off("message", onMessage);
      vapi.off("error", onError);

      // ✅ Avoid WASM_OR_WORKER_NOT_READY error: only call stop() on unmount IF we actively have a live call
      if (isCallActiveRef.current) {
        vapi.stop();
      }
    };
  }, [dispatch]);

  const handleToggleCall = async () => {
    if (!isCallActive) {
      if (!assistantId) {
        toast.error("No assistant selected.");
        return;
      }
      try {
        setIsConnecting(true);
        const balance = await dispatch(fetchWalletBalance()).unwrap();
        if (balance < 0) {
          setIsConnecting(false);
          toast.error("Insufficient balance.");
          setMessages((p) => [...p, { role: "System", text: `Insufficient balance ($${Number(balance).toFixed(2)}). Please top up.` }]);
          return;
        }
        console.log("🚀 Vapi: Attempting to start call with Assistant ID:", assistantId);
        await vapiRef.current.start(assistantId);
      } catch (error) {
        console.error("❌ Vapi: Failed to start call:", error);
        setIsConnecting(false);
        toast.error("Failed to start call.");
        setMessages((p) => [...p, { role: "System", text: "Connection failed." }]);
      }
    } else {
      setIsConnecting(true);
      vapiRef.current.stop();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/40">
      {/* Info banner */}
      <div className="mx-5 mt-4 mb-0 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 font-medium">
        <Info className="w-3.5 h-3.5 flex-shrink-0" />
        Labs do not call tools or book appointments
      </div>

      <div className="flex-1 flex flex-col m-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Call header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isCallActive ? "bg-emerald-400" : "bg-gray-300"}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{assistantName}</p>
              <p className={`text-[10px] font-medium ${isCallActive ? "text-emerald-500" : "text-gray-400"}`}>
                {isCallActive ? "● Live" : "● Offline"}
              </p>
            </div>

            {/* Wallet */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              walletBalance < 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-gray-50 text-gray-600 border-gray-100"
            }`}>
              <Wallet className="w-3 h-3" />
              {fetchingBalance ? "…" : `$${Number(walletBalance).toFixed(2)}`}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleToggleCall}
            disabled={isConnecting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-70 ${
              isCallActive
                ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCallActive ? (
              <PhoneOff className="w-4 h-4" />
            ) : (
              <Phone className="w-4 h-4" />
            )}
            {isConnecting
              ? isCallActive ? "Ending…" : "Connecting…"
              : isCallActive ? "End Call" : "Start Call"
            }
          </motion.button>
        </div>

        {/* Chat area */}
        <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto bg-gray-50/30">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex items-start gap-2 ${
                  msg.role === "User" ? "flex-row-reverse" :
                  msg.role === "System" ? "justify-center" : ""
                }`}
              >
                {msg.role !== "System" && (
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                    msg.role === "AI"
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                      : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
                  }`}>
                    {msg.role === "AI" ? "AI" : "U"}
                  </div>
                )}
                <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${ROLE_STYLES[msg.role]}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}

            {/* Live AI partial */}
            {currentAITranscript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">AI</div>
                <div className="bg-gray-50 border border-gray-100 text-gray-500 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-sm italic opacity-70">
                  {currentAITranscript}
                </div>
              </motion.div>
            )}

            {/* Live user partial */}
            {currentUserTranscript && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2 flex-row-reverse"
              >
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[9px] font-black text-white flex-shrink-0">U</div>
                <div className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm italic opacity-70">
                  {currentUserTranscript}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isCallActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 pt-2"
            >
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((j) => (
                  <motion.div
                    key={j}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ scaleY: [1, 2.5, 1] }}
                    transition={{ duration: 0.8, delay: j * 0.15, repeat: Infinity }}
                  />
                ))}
              </div>
              <span className="text-xs text-emerald-500 font-medium">Listening…</span>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
};
