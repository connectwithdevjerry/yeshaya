import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError, clearSuccessMessage } from "../../store/slices/authSlice";
import AuthLayout from "../../components/auth/AuthLayout";

/* ── Email sent success view ── */
const EmailSent = ({ email, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.35 }}
    className="text-center"
  >
    <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
      >
        <Mail className="w-9 h-9 text-indigo-500" />
      </motion.div>
    </div>

    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
    <p className="text-gray-500 text-sm mb-5">We sent a reset link to</p>

    <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
      <Mail className="w-4 h-4 text-indigo-400" />
      <span className="text-sm font-semibold text-indigo-700">{email}</span>
    </div>

    <p className="text-xs text-gray-400 mb-8 max-w-xs mx-auto">
      Click the link in the email to reset your password or activate your account. The link expires in 1 hour.
    </p>

    <div className="space-y-3">
      <button
        onClick={onRetry}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all duration-150"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Resend email
      </button>
      <Link
        to="/login"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
      </Link>
    </div>
  </motion.div>
);

const ResetLink = () => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(s => s.auth);

  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => () => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) setSubmitted(true);
  }, [successMessage]);

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(false);
    dispatch(resetPassword(email));
  };

  const handleRetry = () => {
    setSubmitted(false);
    dispatch(clearSuccessMessage());
  };

  return (
    <AuthLayout
      panelTitle="Recover your account in seconds."
      panelSubtitle="Enter your email and we'll send you a link to reset your password or re-activate your account."
    >
      <AnimatePresence mode="wait">
        {submitted && successMessage ? (
          <EmailSent key="sent" email={email} onRetry={handleRetry} />
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
              <p className="text-gray-500 text-sm mt-1.5">
                Enter your email and we'll send you a recovery link.
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-5 flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
                >
                  <span>⚠</span>
                  {typeof error === "string" ? error : error.message || "Something went wrong."}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm
                  bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25
                  hover:shadow-indigo-500/40 hover:brightness-110
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <>Send recovery link</>
                )}
              </motion.button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all duration-150"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
              </Link>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Works for both password reset and account activation.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default ResetLink;
