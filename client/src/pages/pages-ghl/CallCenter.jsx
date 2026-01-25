import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import HeaderFilters from "../../components/components-ghl/CallCenter/HeadFilters";
import MetricCard from "../../components/components-ghl/CallCenter/MetricCard";
import {
  Phone,
  PhoneOutgoing,
  PhoneIncoming,
  Globe,
  DollarSign,
  User,
  Cpu,
  Voicemail,
  ArrowLeftRight,
  Calendar,
  Clock,
  Timer,
  Wallet,
  Loader2,
} from "lucide-react";
import DownloadContact from "../../components/components-ghl/CallCenter/DownloadContact";
import FunnelVisual from "../../components/components-ghl/CallCenter/FunnelChart";
import PieChartsDashboard from "../../components/components-ghl/CallCenter/PieChartDashboard";
import CallCharts from "../../components/components-ghl/CallCenter/CallsChart";
import { getAssistantAnalytics } from "../../store/slices/assistantsSlice";

const CallDashboard = () => {
  const dispatch = useDispatch();
  const [activeModal, setActiveModal] = useState("dataCenter");
  
  // Get analytics from Redux
  const { analytics, fetchingAnalytics, analyticsError } = useSelector(
    (state) => state.assistants
  );

  // Fetch analytics on component mount
  useEffect(() => {
    dispatch(getAssistantAnalytics());
  }, [dispatch]);

  // Build metrics array from analytics data
  const metrics = [
    {
      label: "Total Calls",
      value: analytics?.totalCalls || 0,
      icon: <Phone />,
      color: "text-blue-500",
      tooltip: "Total number of calls handled by all assistants.",
    },
    {
      label: "Outbound Calls",
      value: analytics?.outboundCalls || 0,
      icon: <PhoneOutgoing />,
      color: "text-green-500",
      tooltip: "Calls initiated by your assistants to customers or leads.",
    },
    {
      label: "Inbound Calls",
      value: analytics?.inboundCalls || 0,
      icon: <PhoneIncoming />,
      color: "text-yellow-500",
      tooltip: "Calls received from customers or clients.",
    },
    {
      label: "Web Calls",
      value: analytics?.webCalls || 0,
      icon: <Globe />,
      color: "text-purple-500",
      tooltip: "Calls made through the website or web widget.",
    },
    {
      label: "Cost Per Dial",
      value: analytics?.costPerDial ? `$${analytics.costPerDial}` : "$0.00",
      icon: <DollarSign />,
      color: "text-red-500",
      tooltip: "Average cost incurred for each outbound call made.",
    },
    {
      label: "Contact Ends",
      value: analytics?.contactEnds || 0,
      icon: <User />,
      color: "text-amber-600",
      tooltip: "Total number of calls that ended with a live contact.",
    },
    {
      label: "AI Ends",
      value: analytics?.aiEnds || 0,
      icon: <Cpu />,
      color: "text-amber-700",
      tooltip: "Calls concluded automatically by the AI assistant.",
    },
    {
      label: "Voicemails",
      value: analytics?.voicemails || 0,
      icon: <Voicemail />,
      color: "text-amber-800",
      tooltip: "Number of voicemail messages left by callers.",
    },
    {
      label: "Transfers",
      value: analytics?.transfers || 0,
      icon: <ArrowLeftRight />,
      color: "text-teal-600",
      tooltip: "Total calls that were transferred to another agent or department.",
    },
    {
      label: "Appointments",
      value: analytics?.appointments || 0,
      icon: <Calendar />,
      color: "text-emerald-600",
      tooltip: "Number of appointments successfully booked from calls.",
    },
    {
      label: "Total Call Time",
      value: analytics?.totalCallTimeFormatted || "0m 0s",
      icon: <Clock />,
      color: "text-orange-500",
      tooltip: "Combined total duration of all calls.",
    },
    {
      label: "Avg Call Time",
      value: analytics?.avgCallTimeMinutes ? `${analytics.avgCallTimeMinutes} mins` : "0.00 mins",
      icon: <Timer />,
      color: "text-sky-500",
      tooltip: "Average duration per call session.",
    },
    {
      label: "Total Spend",
      value: analytics?.totalSpendFormatted || "$0.00",
      icon: <Wallet />,
      color: "text-rose-500",
      tooltip: "Total amount spent on calls within this period.",
    },
    {
      label: "Cost Per Appointment",
      value: analytics?.costPerAppointment ? `$${analytics.costPerAppointment}` : "$0.00",
      icon: <DollarSign />,
      color: "text-green-700",
      tooltip: "Average cost incurred for each booked appointment.",
    },
    {
      label: "Cost Per Transfer",
      value: analytics?.costPerTransfer ? `$${analytics.costPerTransfer}` : "$0.00",
      icon: <DollarSign />,
      color: "text-green-500",
      tooltip: "Average cost per successful call transfer.",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Top Buttons */}
      <div className="flex bg-white p-3 gap-4 border-b">
        <button
          className={`px-3 border py-2 text-sm font-medium rounded-md transition ${
            activeModal === "dataCenter"
              ? "bg-blue-500 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
          onClick={() =>
            setActiveModal(activeModal === "dataCenter" ? null : "dataCenter")
          }
        >
          Data Center
        </button>
        <button
          className={`px-3 border py-2 text-sm font-medium rounded-md transition ${
            activeModal === "callList"
              ? "bg-blue-500 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
          onClick={() =>
            setActiveModal(activeModal === "callList" ? null : "callList")
          }
        >
          Call List
        </button>
      </div>

      {/* Loading State */}
      {fetchingAnalytics && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-gray-600">Loading analytics...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {analyticsError && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            Error loading analytics: {analyticsError}
          </p>
          <button
            onClick={() => dispatch(getAssistantAnalytics())}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data Center View */}
      {activeModal === "dataCenter" && !fetchingAnalytics && (
        <div className="p-6 animate-fadeIn">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {metrics.map((m, i) => (
              <MetricCard key={i} {...m} />
            ))}
          </div>

          {/* Charts Section */}
          <div className="flex flex-col gap-4 mb-8">
            {/* <FunnelVisual /> */}
            <PieChartsDashboard />
            <CallCharts />
          </div>
        </div>
      )}

      {/* Call List View */}
      {activeModal === "callList" && <DownloadContact />}
    </div>
  );
};

export default CallDashboard;