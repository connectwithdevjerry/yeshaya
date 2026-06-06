import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { login, clearError } from "../../store/slices/authSlice";
import AuthLayout from "../../components/auth/AuthLayout";

/* ── Reusable field wrapper ── */
const Field = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

/* ── Alert banner ── */
const AlertBanner = ({ type, error }) => {
  if (!error) return null;
  const cfg = {
    activation: { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" /> },
    invalid:    { bg: "bg-red-50 border-red-200",     text: "text-red-700",   icon: <AlertCircle className="w-4 h-4 flex-shrink-0" /> },
    server:     { bg: "bg-gray-50 border-gray-200",   text: "text-gray-700",  icon: <AlertCircle className="w-4 h-4 flex-shrink-0" /> },
  };
  const { bg, text, icon } = cfg[type] || cfg.server;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-sm ${bg} ${text}`}
    >
      {icon}
      <div className="flex-1">
        {type === "activation" && <p className="font-semibold mb-0.5">Account not activated</p>}
        <p>{error}</p>
        {type === "activation" && (
          <Link to="/reset-link" className="inline-block mt-1.5 text-xs font-semibold underline underline-offset-2">
            Request a new activation link →
          </Link>
        )}
      </div>
    </motion.div>
  );
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, accessToken, user } = useSelector(s => s.auth);

  const [formData, setFormData]   = useState({ email: "", password: "" });
  const [showPw, setShowPw]       = useState(false);
  const [rememberMe, setRemember] = useState(false);
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, accessToken, navigate]);

  useEffect(() => {
    if (typeof error === "string") {
      const l = error.toLowerCase();
      if (l.includes("activate"))                                                                    setAlertType("activation");
      else if (l.includes("invalid") || l.includes("incorrect") || l.includes("not found") ||
               l.includes("wrong")   || l.includes("email")     || l.includes("password")) setAlertType("invalid");
      else setAlertType("server");
    } else setAlertType("");
  }, [error]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(login(formData));
  };

  return (
    <AuthLayout
      panelTitle="Welcome back. Let's get to work."
      panelSubtitle="Log in to manage your AI voice assistants, call analytics, and CRM integrations."
    >
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
        <p className="text-gray-500 text-sm mt-1.5">
          Don't have one?{" "}
          <Link to="/register" className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
            Create a free account
          </Link>
        </p>
      </div>

      {/* Alert */}
      <AnimatePresence mode="wait">
        {error && (
          <div className="mb-5">
            <AlertBanner type={alertType} error={error} />
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email address">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </Field>

        <Field label="Password">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Field>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 accent-indigo-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            to="/reset-link"
            className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
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
            <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
          ) : (
            <> Sign in <ArrowRight className="w-4 h-4" /></>
          )}
        </motion.button>

        {/* Social sign-in (disabled until OAuth providers are wired)
        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => {}} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">Google</button>
          <button type="button" onClick={() => {}} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">Microsoft</button>
        </div>
        */}
      </form>

      {/* Trust indicator */}
      <p className="mt-6 text-center text-xs text-gray-400">
        🔒 Your data is encrypted and never shared.
      </p>
    </AuthLayout>
  );
};

export default Login;
