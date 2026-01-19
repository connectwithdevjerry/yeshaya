import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Info, Send } from "lucide-react";
import { sendChatMessage } from "../../../../store/slices/assistantsSlice";
import { getAssistantIdFromUrl } from "../../../../utils/urlUtils";

export const ChatLabView = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const assistantId = getAssistantIdFromUrl(searchParams);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);

  const assistantName = useSelector(
    (state) => state.assistants?.selectedAssistant?.name || "Assistant",
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !assistantId) return;

    const userText = inputValue;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInputValue("");

    // Add thinking state
    setMessages((prev) => [
      ...prev,
      { role: "assistant", isLoading: true, name: assistantName },
    ]);

    try {
      const response = await dispatch(
        sendChatMessage({ assistantId, userText }),
      ).unwrap();

      // Accessing response.reply based on your JSON example:
      // { "status": true, "reply": [{ "role": "assistant", "content": "..." }] }
      const botReply = response.reply?.[0]?.content || "No response received.";

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        updated[lastIndex] = {
          role: "assistant",
          isLoading: false,
          name: assistantName,
          content: botReply,
        };
        return updated;
      });
    } catch (error) {
      console.error("Chat Error:", error);
      // ... handle error UI
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white p-2 relative">
      <div className="flex justify-between items-center mb-2 px-4 text-sm text-gray-700">
        <div className="flex items-center space-x-3 ml-auto">
          <span className="text-blue-500 px-3 py-1 border border-blue-100 rounded-md text-xs font-medium bg-blue-50/30">
            Live Lab Mode
          </span>
          <button
            onClick={() => setMessages([])}
            className="text-blue-600 px-3 py-1 border border-blue-100 rounded-md text-xs font-medium hover:bg-blue-50"
          >
            Clear conversation
          </button>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="mx-4 p-2 mb-8 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800 flex items-center justify-center text-sm font-medium">
        <Info className="w-4 h-4 mr-2" />
        Labs do not call tools or book appointments
      </div>

      {/* Main Content Area */}
      <div
        className="flex-1 overflow-y-auto px-4 custom-scrollbar"
        ref={scrollRef}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2">
            <div className="text-2xl mb-1">🤖</div>
            <h3 className="text-xl font-bold text-gray-900">Chat Lab</h3>
            <p className="text-sm text-gray-500 font-medium">
              Test your assistant's knowledge and prompts here.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 pt-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-gray-500 mr-1">
                      You
                    </span>
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-gray-800 shadow-sm font-medium">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-2 w-full max-w-[80%]">
                    <div className="flex items-center gap-2 pl-1">
                      <span className="text-lg">🤖</span>
                      <span className="text-xs font-bold text-gray-800">
                        {msg.name}
                      </span>
                    </div>
                    {msg.isLoading ? (
                      <div className="w-full max-w-[400px] bg-[#f8f9fa] border border-gray-100 p-4 rounded-xl space-y-3">
                        <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-[85%] animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded-full w-[40%] animate-pulse"></div>
                      </div>
                    ) : (
                      <div className="w-full bg-[#4f86f7] text-white p-4 rounded-xl shadow-sm text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 pb-4 pt-4">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full p-4 pr-14 border border-gray-200 rounded-xl outline-none text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-100"
            placeholder="Message your AI"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#10b981] text-white rounded-lg shadow-sm disabled:opacity-50"
          >
            <Send className="w-5 h-5 rotate-45" />
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400 text-center">
          AI can make mistakes - check important information.
        </p>
      </div>
    </div>
  );
};
