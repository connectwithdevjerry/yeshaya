// src/pages/pages-ghl/CallCenter.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, PhoneOutgoing, PhoneIncoming, Globe,
  DollarSign, User, Cpu, Voicemail, ArrowLeftRight,
  Calendar, Clock, Timer, Wallet, Loader2,
  BarChart2, List, RefreshCw, TrendingUp,
} from "lucide-react";
import MetricCard       from "../../components/components-ghl/CallCenter/MetricCard";
import DownloadContact  from "../../components/components-ghl/CallCenter/DownloadContact";
import PieChartsDashboard from "../../components/components-ghl/CallCenter/PieChartDashboard";
import CallCharts       from "../../components/components-ghl/CallCenter/CallsChart";
import { getAssistantAnalytics } from "../../store/slices/assistantsSlice";
import { getSubaccountIdFromUrl } from "../../utils/urlUtils";
import { useSearchParams } from "react-router-dom";

/* ── Skeleton metric card ── */
const MetricSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden">
    <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-gray-100 relative" />
    <div className="flex items-start justify-between mb-3">
      <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
      <div className="w-5 h-5 rounded bg-gray-100 animate-pulse" />
    </div>
    <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse mb-2" />
    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
  </div>
);

const TABS = [
  { id: "dataCenter", label: "Data Center", icon: BarChart2 },
  { id: "callList",   label: "Call List",   icon: List      },
];

const CallDashboard = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);
  const [activeTab, setActiveTab] = useState("dataCenter");

  const { analytics, fetchingAnalytics, analyticsError } = useSelector(
    (state) => state.assistants
  );

  useEffect(() => {
    dispatch(getAssistantAnalytics(subaccountId));
  }, [dispatch, subaccountId]);

  const metrics = [
    { label: "Total Calls",          value: analytics?.totalCalls ?? 0,                              icon: <Phone />,          color: "text-blue-500",    tooltip: "Total number of calls handled by all assistants."                  },
    { label: "Outbound Calls",       value: analytics?.outboundCalls ?? 0,                           icon: <PhoneOutgoing />,  color: "text-green-500",   tooltip: "Calls initiated by your assistants to customers or leads."         },
    { label: "Inbound Calls",        value: analytics?.inboundCalls ?? 0,                            icon: <PhoneIncoming />,  color: "text-yellow-500",  tooltip: "Calls received from customers or clients."                         },
    { label: "Web Calls",            value: analytics?.webCalls ?? 0,                                icon: <Globe />,          color: "text-purple-500",  tooltip: "Calls made through the website or web widget."                     },
    { label: "Cost Per Dial",        value: analytics?.costPerDial ? `$${analytics.costPerDial}` : "$0.00", icon: <DollarSign />, color: "text-red-500", tooltip: "Average cost incurred for each outbound call made."              },
    { label: "Contact Ends",         value: analytics?.contactEnds ?? 0,                             icon: <User />,           color: "text-amber-600",   tooltip: "Total number of calls that ended with a live contact."             },
    { label: "AI Ends",              value: analytics?.aiEnds ?? 0,                                  icon: <Cpu />,            color: "text-amber-700",   tooltip: "Calls concluded automatically by the AI assistant."                },
    { label: "Voicemails",           value: analytics?.voicemails ?? 0,                              icon: <Voicemail />,      color: "text-amber-800",   tooltip: "Number of voicemail messages left by callers."                     },
    { label: "Transfers",            value: analytics?.transfers ?? 0,                               icon: <ArrowLeftRight />, color: "text-teal-600",    tooltip: "Total calls that were transferred to another agent or department."  },
    { label: "Appointments",         value: analytics?.appointments ?? 0,                            icon: <Calendar />,       color: "text-emerald-600", tooltip: "Number of appointments successfully booked from calls."            },
    { label: "Total Call Time",      value: analytics?.totalCallTimeFormatted || "0m 0s",            icon: <Clock />,          color: "text-orange-500",  tooltip: "Combined total duration of all calls."                             },
    { label: "Avg Call Time",        value: analytics?.avgCallTimeMinutes ? `${analytics.avgCallTimeMinutes} mins` : "0.00 mins", icon: <Timer />, color: "text-sky-500", tooltip: "Average duration per call session."        },
    { label: "Total Spend",          value: analytics?.totalSpendFormatted || "$0.00",               icon: <Wallet />,         color: "text-rose-500",    tooltip: "Total amount spent on calls within this period."                   },
    { label: "Cost Per Appointment", value: analytics?.costPerAppointment ? `$${analytics.costPerAppointment}` : "$0.00", icon: <DollarSign />, color: "text-green-700", tooltip: "Average cost per booked appointment."      },
    { label: "Cost Per Transfer",    value: analytics?.costPerTransfer ? `$${analytics.costPerTransfer}` : "$0.00",   icon: <DollarSign />, color: "text-green-500",  tooltip: "Average cost per successful call transfer."  },
  ];

  /* ── Hero KPIs (top 4) ── */
  const heroStats = [
    { label: "Total Calls",  value: analytics?.totalCalls ?? 0,                    gradient: "from-blue-500 to-indigo-600",   icon: Phone      },
    { label: "Total Spend",  value: analytics?.totalSpendFormatted || "$0.00",      gradient: "from-rose-500 to-pink-600",     icon: Wallet     },
    { label: "Appointments", value: analytics?.appointments ?? 0,                   gradient: "from-emerald-500 to-teal-600",  icon: Calendar   },
    { label: "Avg Duration", value: analytics?.avgCallTimeMinutes ? `${analytics.avgCallTimeMinutes}m` : "0m", gradient: "from-violet-500 to-purple-600", icon: Timer },
  ];

  return (
    <div className="bg-gray-50/60 min-h-screen">

      {/* ── Tab strip ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-0">
        <div className="flex gap-1 pt-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <motion.button
                key={id}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.12 }}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150
                  ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {isActive && (
                  <motion.span
                    layoutId="callCenterTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600"
                  />
                )}
              </motion.button>
            );
          })}

          {/* Refresh button */}
          <div className="ml-auto flex items-center pb-1">
            <button
              onClick={() => dispatch(getAssistantAnalytics(subaccountId))}
              disabled={fetchingAnalytics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingAnalytics ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Data Center ── */}
        {activeTab === "dataCenter" && (
          <motion.div
            key="dataCenter"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="p-6 space-y-6"
          >

            {/* Error */}
            {analyticsError && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
                <p className="text-red-600 text-sm">Failed to load analytics: {analyticsError}</p>
                <button
                  onClick={() => dispatch(getAssistantAnalytics(subaccountId))}
                  className="text-xs text-red-500 hover:text-red-700 font-medium underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Hero KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {heroStats.map(({ label, value, gradient, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-lg shadow-black/10 relative overflow-hidden`}
                >
                  {/* bg icon watermark */}
                  <Icon className="absolute -right-3 -bottom-3 w-20 h-20 opacity-10" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold leading-none tabular-nums">
                    {fetchingAnalytics ? (
                      <span className="inline-block h-7 w-16 bg-white/20 rounded-lg animate-pulse" />
                    ) : value}
                  </p>
                  <p className="text-xs text-white/70 mt-1 font-medium uppercase tracking-wide">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Detailed metric grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Detailed Metrics</h3>
              </div>

              {fetchingAnalytics ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <MetricSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {metrics.map((m, i) => (
                    <MetricCard key={i} index={i} {...m} />
                  ))}
                </div>
              )}
            </div>

            {/* Charts */}
            {!fetchingAnalytics && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="space-y-4"
              >
                <PieChartsDashboard />
                <CallCharts />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Call List ── */}
        {activeTab === "callList" && (
          <motion.div
            key="callList"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <DownloadContact />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default CallDashboard;
