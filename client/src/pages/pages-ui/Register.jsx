import React, { useState, useEffect } from "react";
import { Bot, Eye, EyeOff, Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, clearSuccessMessage } from "../../store/slices/authSlice";
import AuthLayout from "../../components/auth/AuthLayout";

/* ── Password strength ── */
const getStrength = (pw) => {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const levels = [
    { label: "Too short",  color: "bg-red-400",    w: "w-1/4" },
    { label: "Weak",       color: "bg-red-400",    w: "w-1/4" },
    { label: "Fair",       color: "bg-amber-400",  w: "w-2/4" },
    { label: "Good",       color: "bg-blue-400",   w: "w-3/4" },
    { label: "Strong",     color: "bg-emerald-500",w: "w-full" },
  ];
  return levels[pw.length < 8 ? 0 : s];
};

/* ── Success screen ── */
const SuccessScreen = ({ email, onRetry }) => (
  <AuthLayout
    panelTitle="Check your inbox!"
    panelSubtitle="We just sent you an email to verify your account. Click the link inside to get started."
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="text-center"
    >
      <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        >
          <Mail className="w-9 h-9 text-emerald-500" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
      <p className="text-gray-500 text-sm mb-5">
        We sent an activation link to
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
        <Mail className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold text-indigo-700">{email}</span>
      </div>
      <p className="text-xs text-gray-400 mb-8">
        Click the link in the email to verify your account. Don't see it? Check your spam folder.
      </p>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-all duration-150"
        >
          Resend activation email
        </button>
        <Link
          to="/login"
          className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold text-center shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
        >
          Back to sign in
        </Link>
      </div>
    </motion.div>
  </AuthLayout>
);

const Register = () => {
  const dispatch = useDispatch();
  const { loading, error, registrationSuccess, successMessage } = useSelector(s => s.auth);

  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPw, setShowPw]     = useState(false);
  const [agreed, setAgreed]     = useState(false);

  useEffect(() => () => {
    dispatch(clearError());
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); dispatch(register(formData)); };

  if (registrationSuccess) {
    return (
      <SuccessScreen
        email={formData.email}
        onRetry={() => dispatch(clearSuccessMessage())}
      />
    );
  }

  const strength = getStrength(formData.password);

  return (
    <AuthLayout
      panelTitle="Join thousands of agencies using AI."
      panelSubtitle="Create your account and start building AI voice assistants that work around the clock."
    >
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="text-gray-500 text-sm mt-1.5">
          Already have one?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
          >
            <span className="text-red-400 mt-0.5">⚠</span>
            {typeof error === "string" ? error : error?.message || "Registration failed. Please try again."}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">First name</label>
            <input
              type="text" name="firstName" placeholder="Jane" required autoComplete="given-name"
              value={formData.firstName} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Last name</label>
            <input
              type="text" name="lastName" placeholder="Smith" required autoComplete="family-name"
              value={formData.lastName} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Work email</label>
          <input
            type="email" name="email" placeholder="you@company.com" required autoComplete="email"
            value={formData.email} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} name="password"
              placeholder="At least 8 characters" required autoComplete="new-password"
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Strength bar */}
          {strength && (
            <div className="space-y-1">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.w}`}
                  initial={{ width: 0 }}
                  animate={{ width: "auto" }}
                />
              </div>
              <p className="text-xs text-gray-400">
                Password strength: <span className="font-medium text-gray-600">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
            required
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            By signing up, you agree to our{" "}
            <span className="text-indigo-600 hover:underline cursor-pointer">Terms of Service</span>,{" "}
            <span className="text-indigo-600 hover:underline cursor-pointer">Usage Policy</span>, and{" "}
            <span className="text-indigo-600 hover:underline cursor-pointer">Privacy Policy</span>.
          </span>
        </label>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || !agreed}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm
            bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25
            hover:shadow-indigo-500/40 hover:brightness-110
            disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-1"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
          ) : (
            <>Get started today <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>
      </form>
    </AuthLayout>
  );
};

export default Register;
