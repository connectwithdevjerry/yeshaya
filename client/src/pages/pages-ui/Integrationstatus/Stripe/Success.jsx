import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, CreditCard, DollarSign,
  BarChart3, Sparkles, ExternalLink,
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
  { x: 8,  size: 8,  color: "bg-violet-400", delay: 0    },
  { x: 22, size: 12, color: "bg-indigo-300", delay: 0.3  },
  { x: 38, size: 6,  color: "bg-violet-300", delay: 0.6  },
  { x: 52, size: 10, color: "bg-purple-400", delay: 0.2  },
  { x: 67, size: 8,  color: "bg-indigo-400", delay: 0.8  },
  { x: 80, size: 14, color: "bg-violet-200", delay: 0.4  },
  { x: 90, size: 6,  color: "bg-purple-300", delay: 1.0  },
  { x: 3,  size: 10, color: "bg-indigo-500", delay: 1.2  },
];

const FEATURES = [
  { icon: CreditCard,  label: "Accept Payments",  desc: "Charge sub-accounts for AI usage"        },
  { icon: DollarSign,  label: "Re-billing",        desc: "Set custom pricing per feature"          },
  { icon: BarChart3,   label: "Revenue Tracking",  desc: "Monitor earnings across accounts"        },
];

const StripeConnectionSuccess = () => {
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-3xl" />
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
          <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

          <div className="p-8">

            {/* Success icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white flex items-center justify-center shadow"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                </motion.div>
              </div>
            </div>

            {/* Stripe logo pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mb-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <img
                  src="https://freelogopng.com/images/all_img/1685814539stripe-icon-png.png"
                  alt="Stripe"
                  className="w-4 h-4 rounded object-contain"
                />
                <span className="text-xs font-semibold text-violet-400">Stripe</span>
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
              Your Stripe account is now linked. You can start billing sub-accounts and tracking revenue.
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
                      <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
                        <f.icon className="w-4 h-4 text-violet-400" />
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
                onClick={() => navigate("/rebilling")}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:brightness-110 transition-all"
              >
                Go to Rebilling <ArrowRight className="w-4 h-4" />
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

export default StripeConnectionSuccess;
