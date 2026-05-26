import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Minimal centered layout for status pages ── */
const StatusLayout = ({ children }) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center px-5 relative overflow-hidden"
    style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)" }}
  >
    {/* Dot grid */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.06) 1.5px, transparent 0)",
        backgroundSize: "36px 36px",
      }}
    />
    {/* Glow orbs */}
    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

    {/* Brand mark */}
    <div className="relative z-10 mb-8">
      <img
        src="https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/r4butMmtLNMrYoaq29aF/media/68e2404e47e70ac013e149a0.jpeg"
        alt="Yashayah AI"
        className="w-12 h-12 rounded-xl object-cover shadow-lg"
      />
    </div>

    <motion.div
      className="relative z-10 w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  </div>
);

const VerifyEmail = () => {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const BaseUrl    = import.meta.env.VITE_API_BASE_URL;

  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState("loading"); // 'loading' | 'success' | 'error'
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get(`${BaseUrl}/auth/activate/${token}`, {
          headers: { Accept: "application/json" },
          validateStatus: s => s < 500,
        });

        if (
          res.data && typeof res.data === "object" &&
          (res.data.status === true || res.data.message?.toLowerCase().includes("verified"))
        ) {
          setMessage(res.data.message || "Email verified successfully!");
          setStatus("success");
          setTimeout(() => navigate("/login"), 2500);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        let msg = "Verification failed. The activation link may be invalid.";
        if (err.response?.data?.message) msg = err.response.data.message;
        else if (typeof err.response?.data === "string" && err.response.data.includes("<!DOCTYPE html>"))
          msg = "Invalid server response — please open the link directly or contact support.";

        setMessage(msg);
        setStatus("error");
        setExpired(msg.toLowerCase().includes("expired"));
      }
    };
    if (token) verify();
  }, [token, navigate]);

  return (
    <StatusLayout>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <AnimatePresence mode="wait">

          {/* Loading */}
          {status === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verifying your email…</h2>
              <p className="text-slate-400 text-sm">Please wait while we confirm your account.</p>
            </motion.div>
          )}

          {/* Success */}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email verified!</h2>
              <p className="text-slate-300 text-sm mb-6">{message}</p>
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Redirecting you to sign in…
              </div>
            </motion.div>
          )}

          {/* Error */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                {expired ? "Link expired" : "Verification failed"}
              </h2>
              <p className="text-slate-400 text-sm mb-6">{message}</p>

              <div className="space-y-3">
                {expired ? (
                  <button
                    onClick={() => navigate("/reset-link")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:brightness-110 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4" /> Request a new link
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/reset-link")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:brightness-110 transition-all duration-200"
                  >
                    <Mail className="w-4 h-4" /> Request new activation link
                  </button>
                )}
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-all duration-150"
                >
                  Back to sign in <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </StatusLayout>
  );
};

export default VerifyEmail;
