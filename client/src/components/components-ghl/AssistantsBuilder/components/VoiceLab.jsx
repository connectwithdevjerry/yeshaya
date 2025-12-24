import React, { useState } from "react";
import { Info, Mic, PhoneOff } from "lucide-react";

export const VoiceLabView = () => {
  const [isCallActive, setIsCallActive] = useState(false);

  // Mock conversation data based on your screenshot
  const messages = [
    {
      role: "AI",
      text: 'Hello! Click "Start Call" to begin the conversation.',
    },
    { role: "AI", text: "Connecting..." },
    {
      role: "AI",
      text: "Hey there! Welcome to Upscale BOS. I'm James, and I'm really glad you reached out. I'm here to help with any tax questions you might have or to get you scheduled with one of our team members. What brings you in today?",
    },
    { role: "User", text: "Yeah." },
    { role: "AI", text: "So what can" },
  ];

  const handleToggleCall = () => {
    setIsCallActive(!isCallActive);
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#f8f9fa] p-6 relative">
      <div className="w-full p-2 mb-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center">
        <span className="font-medium flex items-center text-sm">
          <Info className="w-4 h-4 mr-2" />
          Labs do not call tools or book appointments
        </span>
      </div>
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-center p-4 border-b border-gray-50">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCallActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></span>
            <span className="text-sm font-medium text-gray-700">Jerry</span>
          </div>
          <button
            onClick={handleToggleCall}
            className={`px-5 py-1.5 rounded-md font-bold text-sm transition-all shadow-sm ${
              isCallActive
                ? "bg-[#ef4444] text-white hover:bg-red-600"
                : "bg-[#22c55e] text-white hover:bg-green-600"
            }`}
          >
            {isCallActive ? "End Call" : "Start Call"}
          </button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto">
          {(isCallActive ? messages : [messages[0]]).map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === "User" ? "flex-row-reverse" : ""
              }`}
            >
              {/* Avatar Label */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                  {msg.role === "AI" ? "AI" : "You"}
                </div>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "AI"
                    ? "bg-[#f1f3f4] text-gray-800 rounded-tl-none"
                    : "bg-[#2563eb] text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Subtle "Typing/Listening" indicator for AI when active */}
          {isCallActive && (
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
