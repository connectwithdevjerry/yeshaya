import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RefreshCw, ExternalLink, AlertTriangle, ChevronRight } from "lucide-react";

const TIPS = [
  "Make sure you are logged into the correct GoHighLevel agency account",
  "Check that your GHL agency has the necessary permissions enabled",
  "Ensure pop-ups are not blocked in your browser",
  "Try clearing your browser cache and attempting again",
];

const GHLConnectionFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-500/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-rose-500/8 blur-3xl" />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />

          <div className="p-8">

            {/* Error icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30"
              >
                <XCircle className="w-10 h-10 text-white" />
              </motion.div>
            </div>

            {/* GHL logo pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                <img
                  src="https://canny-assets.io/icons/5b918f2630865c174eaa9483fdedac22.png"
                  alt="GHL"
                  className="w-4 h-4 rounded object-contain"
                />
                <span className="text-xs font-semibold text-red-400">GoHighLevel</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-2"
            >
              <h1 className="text-2xl font-black text-white">Connection Failed</h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-white/50 mb-6"
            >
              Something went wrong while connecting to your GoHighLevel account. Please try again.
            </motion.p>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-7"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <p className="text-xs font-semibold text-amber-400">Things to check</p>
              </div>
              <div className="space-y-2">
                {TIPS.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.08 }}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8"
                  >
                    <ChevronRight className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/50 leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="space-y-3"
            >
              <button
                onClick={() => navigate("/integrations")}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-red-500/25 hover:brightness-110 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => navigate("/integrations")}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/5 hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Back to Integrations
              </button>
            </motion.div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center text-[11px] text-white/25 mt-4"
        >
          If this issue persists, contact support with the error details.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default GHLConnectionFailed;
