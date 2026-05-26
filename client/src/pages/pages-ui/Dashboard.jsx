// src/pages/pages-ui/Dashboard.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users, DollarSign, Info, Link, RefreshCcw, SquareStack,
  Zap, HardDriveDownload, CreditCard, PlusCircle, Link2,
  Copy, CheckCheck, ArrowRight, TrendingUp, Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import apiClient from "../../store/api/config";
import { fetchSubAccounts } from "../../store/slices/integrationSlice";
import { fetchWalletBalance } from "../../store/slices/assistantsSlice";

/* ── Animation variants ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor, trend }) => (
  <motion.div
    variants={cardVariant}
    whileHover={{ y: -3, boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12)" }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 cursor-default"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      {trend && (
        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />{trend}
        </p>
      )}
    </div>
  </motion.div>
);

/* ── Info banner ── */
const InfoBanner = ({ color, children }) => {
  const cfg = {
    blue:  { wrap: "bg-blue-50 border-l-4 border-blue-400",  text: "text-blue-800",  icon: "text-blue-400" },
    green: { wrap: "bg-emerald-50 border-l-4 border-emerald-400", text: "text-emerald-800", icon: "text-emerald-400" },
  };
  const { wrap, text, icon } = cfg[color] || cfg.blue;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${wrap}`}>
      <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${icon}`} />
      <div className={`text-sm ${text} space-y-1`}>{children}</div>
    </div>
  );
};

/* ══════════════════════════════════════════ */
function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { subAccounts }              = useSelector(s => s.integrations || {});
  const { balance }                  = useSelector(s => s.wallet || {});
  const { user }                     = useSelector(s => s.auth || {});
  const { walletBalance }            = useSelector(s => s.assistants || {});

  const [isResetting,     setIsResetting]     = useState(false);
  const [customMenuLink,  setCustomMenuLink]  = useState("");
  const [copied,          setCopied]          = useState(false);

  useEffect(() => {
    dispatch(fetchSubAccounts());
    dispatch(fetchWalletBalance());
    const base = window.location.origin;
    setCustomMenuLink(
      `${base}/app?agencyid={{agency.id}}&subaccount={{location.id}}&allow=yes&myname={{location.name}}&myemail={{user.email}}&route=/assistants`
    );
  }, [dispatch]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(customMenuLink);
    setCopied(true);
    toast.success("Custom menu link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetConnection = async () => {
    if (!window.confirm("Reset your GoHighLevel connection? This will disconnect your agency integration.")) return;
    setIsResetting(true);
    try {
      const res = await apiClient.post("/integrations/reset-ghl-connection");
      if (res.data?.success) {
        toast.success("GoHighLevel connection reset successfully!");
        localStorage.removeItem("ghl_pending_locationId");
        sessionStorage.removeItem("ghl_locationId");
        sessionStorage.removeItem("ghl_captureTime");
        dispatch(fetchSubAccounts());
        setTimeout(() => navigate("/integrations"), 1500);
      } else {
        toast.error(res.data?.message || "Failed to reset connection");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset connection");
    } finally {
      setIsResetting(false);
    }
  };

  /* Derived values */
  const totalSubAccounts = subAccounts?.length || 0;
  const displayBalance   = walletBalance ?? balance ?? 0;
  const activeAssistants = 0;
  const totalCalls       = 0;
  const totalSpent       = 0;

  /* Greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const STATS = [
    { icon: Zap,              label: "Assistants",   value: activeAssistants,            iconBg: "bg-orange-100",  iconColor: "text-orange-500" },
    { icon: Users,            label: "Sub-accounts", value: totalSubAccounts,             iconBg: "bg-violet-100",  iconColor: "text-violet-500" },
    { icon: HardDriveDownload,label: "Wallet",       value: `$${Number(displayBalance).toFixed(2)}`, iconBg: "bg-emerald-100", iconColor: "text-emerald-500" },
    { icon: DollarSign,       label: "Total Spent",  value: `$${totalSpent.toFixed(2)}`, iconBg: "bg-red-100",     iconColor: "text-red-500"    },
    { icon: SquareStack,      label: "Total Calls",  value: totalCalls,                   iconBg: "bg-blue-100",    iconColor: "text-blue-500"   },
  ];

  const QUICK_LINKS = [
    { icon: Link,       label: "Connect GoHighLevel", href: "/integrations" },
    { icon: PlusCircle, label: "Create Sub-account",  href: "/"             },
    { icon: CreditCard, label: "Start Re-billing",    href: "/rebilling"    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-8">

        {/* ── Welcome Hero ── */}
        <motion.div
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] px-8 py-8 shadow-xl"
        >
          {/* background dots */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.07) 1.5px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* glow orb */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span className="text-indigo-300 text-xs font-medium">{today}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                {greeting}, {user?.firstName || user?.name || "there"} 👋
              </h1>
              <p className="text-slate-400 text-sm">
                Let's scale your service offering with voice and chat AI 🤖
              </p>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all duration-150 border border-white/10 hover:border-white/20"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <ArrowRight className="w-3 h-3 ml-0.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {STATS.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

        {/* ── Integration cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* GHL Card */}
          <motion.div
            {...fadeUp(0.2)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">GoHighLevel Agency Integration</h3>
                <p className="text-xs text-gray-400">Manage your agency connection</p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleResetConnection}
              disabled={isResetting}
              className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              <RefreshCcw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} />
              {isResetting ? "Resetting…" : "Reset connection"}
            </motion.button>

            <InfoBanner color="blue">
              <p className="font-semibold">Trouble connecting to GoHighLevel?</p>
              <p>Try an incognito window. Connect to your{" "}
                <a href="/integrations" className="underline font-medium">agency</a>
                , not a sub-account, for us to create accounts.</p>
            </InfoBanner>
          </motion.div>

          {/* Custom Menu Link Card */}
          <motion.div
            {...fadeUp(0.3)}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Custom Menu Link</h3>
                  <p className="text-xs text-gray-400">Add to GoHighLevel agency settings</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                  ${copied
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                    : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:brightness-110"
                  }`}
              >
                {copied ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
              </motion.button>
            </div>

            {/* URL preview box */}
            <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-100 group relative">
              <code className="text-[11px] text-gray-600 break-all leading-relaxed">
                {customMenuLink}
              </code>
            </div>

            <InfoBanner color="green">
              <p className="font-semibold">Add this link to GoHighLevel agency settings.</p>
              <p>Your account will be created on first view. Do not replace the variables. Toggle for{" "}
                <span className="font-semibold">sub-account</span>.</p>
            </InfoBanner>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;
