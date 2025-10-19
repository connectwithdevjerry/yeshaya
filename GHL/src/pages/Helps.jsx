import React from "react";
import { Search } from "lucide-react";

const Helps = () => {
  const categories = [
    "All Articles",
    "General",
    "Bots",
    "Chat",
    "Voice",
    "Knowledge",
    "Active Tags",
    "Numbers",
    "Integrations",
  ];

  const articles = [
    {
      title: "Voice AI Best Practices",
      subtitle:
        "How to get the most out of your voice AI with best practices, tips & tricks and recommended configurations.",
      tag: "Voice",
      level: "Intermediate",
      image:
        "https://i.imgur.com/8zIkx1R.png", // replace with your real image link
    },
    {
      title: "How to Use Custom Tools",
      subtitle:
        "Custom tools are a powerful way to connect your voice and chat AI to 3rd party systems — this doc covers how to use them.",
      tag: "Bots",
      level: "Advanced",
      image: "https://i.imgur.com/bhZpYB7.png",
    },
    {
      title: "Importing Numbers",
      subtitle:
        "Guide on how to import a number from any telephony system using SIP trunking — example uses Twilio.",
      tag: "Numbers",
      level: "Intermediate",
      image: "https://i.imgur.com/9QZ2Cmt.png",
    },
    {
      title: "Knowledge Base Guide",
      subtitle:
        "A comprehensive guide on understanding knowledge bases and best practices for getting the most out of them.",
      tag: "Knowledge",
      level: "Beginner",
      image: "https://i.imgur.com/Y0lFfrW.png",
    },
    {
      title: "Calendar Debugging Guide",
      subtitle:
        "Comprehensive guide on debugging / triaging calendar booking issues and fixing user configurations.",
      tag: "General",
      level: "Beginner",
      image: "https://i.imgur.com/dG8nTgb.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 text-center py-10 text-white">
        <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Explore our documentation by asking a question or using the search
          below to find answers.
        </p>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Ask a question or search..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>

        {/* Popular Solutions */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          <span className="bg-gray-800 text-gray-200 text-xs px-3 py-1 rounded-full">
            Not booking
          </span>
          <span className="bg-gray-800 text-gray-200 text-xs px-3 py-1 rounded-full">
            Prompt guide
          </span>
          <span className="bg-gray-800 text-gray-200 text-xs px-3 py-1 rounded-full">
            No active tag
          </span>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="border-b bg-white">
        <div className="flex flex-wrap justify-center gap-4 py-3">
          {categories.map((cat) => (
            <button
              key={cat}
              className="text-gray-700 text-sm font-medium hover:text-blue-600"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <main className="p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 justify-center">
        {articles.map((a, i) => (
          <div
            key={i}
            className="bg-white border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <img
              src={a.image}
              alt={a.title}
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <div className="flex gap-2 mb-2">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {a.tag}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {a.level}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                {a.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{a.subtitle}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Helps;
