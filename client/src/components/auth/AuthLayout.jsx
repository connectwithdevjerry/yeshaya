import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Zap } from "lucide-react";

const LOGO_URL =
  "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/r4butMmtLNMrYoaq29aF/media/68e2404e47e70ac013e149a0.jpeg";

/* ── Brand logo mark ── */
const BrandMark = ({ size = 44 }) => (
  <img
    src={LOGO_URL}
    alt="Yashayah AI"
    width={size}
    height={size}
    className="rounded-xl object-cover flex-shrink-0"
    style={{ width: size, height: size }}
  />
);

const FEATURES = [
  "AI voice assistants that handle real conversations",
  "Seamless GoHighLevel CRM integration",
  "Smart call routing & real-time analytics",
];

/* ── Shared auth page shell ── */
export default function AuthLayout({ children, panelTitle, panelSubtitle }) {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* ── Left branding panel (desktop only) ── */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}
      >
        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.07) 1.5px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <BrandMark size={44} />
            <div>
              <p className="text-white font-bold text-lg leading-none tracking-tight">Yashayah AI</p>
              <p className="text-slate-400 text-xs mt-0.5">Voice Intelligence Platform</p>
            </div>
          </div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              {panelTitle || "Your AI voice team, always on."}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              {panelSubtitle || "Build, deploy, and manage intelligent voice assistants that handle real conversations — 24/7."}
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.ul
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                </span>
                <span className="text-slate-300 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Bottom trust strip */}
        <div className="relative z-10 flex items-center gap-2 text-slate-500 text-xs">
          <Shield className="w-4 h-4 text-slate-500" />
          <span>256-bit SSL encrypted · SOC 2 ready · GDPR compliant</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <BrandMark size={36} />
          <span className="font-bold text-gray-900 text-base">Yashayah AI</span>
        </div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400">
          © {new Date().getFullYear()} Yashayah AI · All rights reserved
        </p>
      </div>
    </div>
  );
}
