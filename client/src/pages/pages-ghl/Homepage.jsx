// src/pages/pages-ghl/Homepage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.06) 1.5px, transparent 0)",
          backgroundSize: "36px 36px",
        }}
      />
      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
          <Bot className="w-8 h-8 text-white" />
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-indigo-300 font-medium mb-4 border border-white/10">
          <Sparkles className="w-3 h-3" />
          AI-powered workspace
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
          Welcome to your Dashboard
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          Manage calls, view analytics, and monitor performance — all in one place.
          Click below to proceed to your workspace.
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate("/inbox")}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:brightness-110 transition-all duration-200"
        >
          Go to workspace <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default HomePage;
