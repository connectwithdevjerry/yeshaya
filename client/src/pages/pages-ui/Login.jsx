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
      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("acces", accessToken);
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, accessToken, user, navigate]);

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

        {/* Divider */}
        <div className="relative flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6L11.4 24zM12.6 24H24V12.6L12.6 24zM24 11.4V0H12.6L24 11.4zM11.4 0H0v11.4L11.4 0z" fill="#00A4EF"/></svg>
            Microsoft
          </button>
        </div>
      </form>

      {/* Trust indicator */}
      <p className="mt-6 text-center text-xs text-gray-400">
        🔒 Your data is encrypted and never shared.
      </p>
    </AuthLayout>
  );
};

export default Login;
