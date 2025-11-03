import React from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/inbox");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4">
      {/* Icon */}
      <div className="bg-blue-600 p-4 rounded-2xl mb-6 shadow-lg">
        <MessageSquare className="w-10 h-10 text-white" />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">
        Welcome to your Dashboard
      </h1>

      {/* Subtitle */}
      <p className="text-gray-300 max-w-md text-center mb-8">
        Manage calls, view analytics, and monitor performance — all in one place.
        Click below to proceed to your workspace.
      </p>

      {/* Proceed Button */}
      <button
        onClick={handleProceed}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-blue-400/30"
      >
        Proceed →
      </button>
    </div>
  );
};

export default HomePage;
