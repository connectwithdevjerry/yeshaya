import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, Zap, Users, BarChart3,
  Sparkles, ExternalLink,
} from "lucide-react";

/* ── Floating particle ── */
const Particle = ({ delay, x, size, color }) => (
  <motion.div
    className={`absolute rounded-full ${color} opacity-70`}
    style={{ width: size, height: size, left: `${x}%`, bottom: "-10px" }}
    animate={{ y: [0, -700], opacity: [0, 1, 1, 0], rotate: [0, 180] }}
    transition={{ duration: 2.5 + Math.random(), delay, ease: "easeOut", repeat: Infinity, repeatDelay: Math.random() * 3 }}
  />
);

const PARTICLES = [
  { x: 10, size: 8,  color: "bg-orange-400", delay: 0    },
  { x: 25, size: 12, color: "bg-amber-300",  delay: 0.3  },
  { x: 40, size: 6,  color: "bg-orange-300", delay: 0.6  },
  { x: 55, size: 10, color: "bg-yellow-400", delay: 0.2  },
  { x: 70, size: 8,  color: "bg-amber-400",  delay: 0.8  },
  { x: 85, size: 14, color: "bg-orange-200", delay: 0.4  },
  { x: 92, size: 6,  color: "bg-yellow-300", delay: 1.0  },
  { x: 5,  size: 10, color: "bg-amber-500",  delay: 1.2  },
];

const FEATURES = [
  { icon: Users,     label: "Sub-accounts",  desc: "Import & manage your GHL locations"    },
  { icon: Zap,       label: "Automations",   desc: "Trigger workflows from AI calls"       },
  { icon: BarChart3, label: "Analytics",     desc: "Track performance across accounts"     },
];

const GHLConnectionSuccess = () => {
  const navigate = useNavigate();
  const [showFeatures, setShowFeatures] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowFeatures(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

          {/* Top gradient bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />

          <div className="p-8">

            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </motion.div>
              </div>
            </div>

            {/* GHL logo pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <img
                  src="https://canny-assets.io/icons/5b918f2630865c174eaa9483fdedac22.png"
                  alt="GHL"
                  className="w-4 h-4 rounded object-contain"
                />
                <span className="text-xs font-semibold text-orange-400">GoHighLevel</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-2"
            >
              <h1 className="text-2xl font-black text-white">Connected Successfully!</h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm text-white/50 mb-7"
            >
              Your GoHighLevel agency account is now linked. You can import sub-accounts and start automating.
            </motion.p>

            {/* Feature list */}
            <AnimatePresence>
              {showFeatures && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2.5 mb-7"
                >
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{f.label}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{f.desc}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <button
                onClick={() => navigate("/subaccounts")}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all"
              >
                Import Sub-accounts <ArrowRight className="w-4 h-4" />
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

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center text-[11px] text-white/25 mt-4"
        >
          You can disconnect this integration at any time from the Integrations page.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default GHLConnectionSuccess;
