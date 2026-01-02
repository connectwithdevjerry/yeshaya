import React, { useState } from "react";
import { X, Info, Calendar, User, Info as InfoIcon, FileText, Settings, Power, HelpCircle, Smile } from "lucide-react";

const snippets = [
  { id: 1, title: "Booking Protocol", desc: "Simple, yet effective booking protocol", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 2, title: "Calendar Matrix", desc: "For multi-calendar booking in version 2 tools", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
  { id: 3, title: "Identity", desc: "Gives the AI a character to play", icon: User, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: 4, title: "Information Protocol", desc: "Simple, yet effective information extraction", icon: User, color: "text-purple-500", bg: "bg-purple-50" },
  { id: 5, title: "Style Guiderails", desc: "Keeps the AI's output more conversational", icon: InfoIcon, color: "text-blue-400", bg: "bg-blue-50" },
  { id: 6, title: "Response Guidelines", desc: "Overview expectation for the AI response", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 7, title: "Task-based Framework", desc: "A simple task-based framework template", icon: Settings, color: "text-indigo-400", bg: "bg-indigo-50" },
  { id: 8, title: "Auto-Off", desc: "Gives the AI a way to end the conversation", icon: Power, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 9, title: "FAQs", desc: "Explains answers to common questions", icon: HelpCircle, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 10, title: "Casual Responses", desc: "Guides the AI to respond more casually", icon: Smile, color: "text-indigo-500", bg: "bg-indigo-50" },
];

export const PromptSnippetsDropdown = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("General");

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop to close on click outside */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      
      {/* Positioned Dropdown */}
      <div className="absolute top-full mt-2 right-0 z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 w-[380 px] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-[15px] font-bold text-gray-800">Prompt Snippets</h2>
          <Info className="w-4 h-4 text-gray-300" />
        </div>

        {/* Tabs */}
        <div className="flex p-3 gap-3 border-b bg-gray-50/50">
          <button
            onClick={() => setActiveTab("General")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "General" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("Custom")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "Custom" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Custom
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
          {snippets.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2.5 border border-transparent rounded-xl hover:bg-gray-50 hover:border-gray-100 transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-gray-800">{item.title}</span>
                  <span className="text-[10px] text-gray-400 line-clamp-1">{item.desc}</span>
                </div>
              </div>
              <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-all">
                Add
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-gray-50/30 flex justify-between items-center">
          <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600">
            Close
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-blue-700 transition-colors">
            Create Snippet
          </button>
        </div>
      </div>
    </>
  );
};