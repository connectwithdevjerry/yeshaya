import React from "react";
import { Search, MessageCircle } from "lucide-react";

const ChatDashboard = () => {
  const conversations = [
    { id: 1, name: "John Doe", lastMessage: "Hey there!" },
  ];

  return (
    <div className="flex h-[800px] bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Search Bar */}
        <div className="p-2 py-4 border-b border-gray-200">
          <div className="flex border items-center gap-2 bg-white rounded-md shadow-sm px-2 py-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
            >
              <p className="font-medium text-sm">{conv.name}</p>
              <p className="text-xs text-gray-500 truncate">
                {conv.lastMessage}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 p-2 text-xs text-gray-500 flex justify-between items-center">
          <span>Showing 1 - {conversations.length}</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100">
              &lt;
            </button>
            <button className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-100">
              &gt;
            </button>
          </div>
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center">
        <MessageCircle size={28} className="text-gray-400 mb-2" />
        <p className="text-gray-600 font-medium">No conversation selected</p>
        <p className="text-xs text-gray-400">
          Select a conversation to view it here
        </p>
      </main>
    </div>
  );
};

export default ChatDashboard;
