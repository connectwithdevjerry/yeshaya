import React, { useState, useEffect } from "react";
import HeaderFilters from "../components/CallCenter/HeadFilters";
import MetricCard from "../components/CallCenter/MetricCard";
import { dummyCallData } from "../data/accountsData";
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
} from "lucide-react";
import DownloadContact from "../components/CallCenter/DownloadContact";
import FunnelChart from "../components/CallCenter/BigCards";
import BigCards from "../components/CallCenter/BigCards";
import FunnelVisual from "../components/CallCenter/FunnelChart";
import PieChartsDashboard from "../components/CallCenter/PieChartDashboard";
import CallCharts from "../components/CallCenter/CallsChart";

const CallDashboard = () => {
  const [data, setData] = useState({});
  const [activeModal, setActiveModal] = useState("dataCenter");
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(dummyCallData);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    {
      label: "Total Calls",
      value: data.totalCalls,
      icon: <Phone />,
      color: "text-blue-500",
      tooltip: "Total number of calls handled by all agents.",
    },
    {
      label: "Outbound Calls",
      value: data.outboundCalls,
      icon: <PhoneOutgoing />,
      color: "text-green-500",
      tooltip: "Calls initiated by your team to customers or leads.",
    },
    {
      label: "Inbound Calls",
      value: data.inboundCalls,
      icon: <PhoneIncoming />,
      color: "text-yellow-500",
      tooltip: "Calls received from customers or clients.",
    },
    {
      label: "Web Calls",
      value: data.webCalls,
      icon: <Globe />,
      color: "text-purple-500",
      tooltip: "Calls made through the website or web widget.",
    },
    {
      label: "Cost Per Dial",
      value: `$${data.costPerDial?.toFixed(2)}`,
      icon: <DollarSign />,
      color: "text-red-500",
      tooltip: "Average cost incurred for each outbound call made.",
    },
    {
      label: "Contact Ends",
      value: data.contactEnds,
      icon: <User />,
      color: "text-amber-600",
      tooltip: "Total number of calls that ended with a live contact.",
    },
    {
      label: "AI Ends",
      value: data.aiEnds,
      icon: <Cpu />,
      color: "text-amber-700",
      tooltip: "Calls concluded automatically by the AI assistant.",
    },
    {
      label: "Voicemails",
      value: data.voicemails,
      icon: <Voicemail />,
      color: "text-amber-800",
      tooltip: "Number of voicemail messages left by callers.",
    },
    {
      label: "Transfers",
      value: data.transfers,
      icon: <ArrowLeftRight />,
      color: "text-teal-600",
      tooltip:
        "Total calls that were transferred to another agent or department.",
    },
    {
      label: "Appointments",
      value: data.appointments,
      icon: <Calendar />,
      color: "text-emerald-600",
      tooltip: "Number of appointments successfully booked from calls.",
    },
    {
      label: "Total Call Time",
      value: `${data.totalCallTime} mins`,
      icon: <Clock />,
      color: "text-orange-500",
      tooltip: "Combined total duration of all calls.",
    },
    {
      label: "Avg Call Time",
      value: `${data.avgCallTime} mins`,
      icon: <Timer />,
      color: "text-sky-500",
      tooltip: "Average duration per call session.",
    },
    {
      label: "Total Spend",
      value: `$${data.totalSpend?.toFixed(2)}`,
      icon: <Wallet />,
      color: "text-rose-500",
      tooltip: "Total amount spent on calls within this period.",
    },
    {
      label: "Cost Per Booked Appointment",
      value: `$${data.costPerBookedAppointment?.toFixed(2)}`,
      icon: <DollarSign />,
      color: "text-green-700",
      tooltip: "Average cost incurred for each booked appointment.",
    },
    {
      label: "Cost Per Transfer",
      value: `$${data.costPerTransfer?.toFixed(2)}`,
      icon: <DollarSign />,
      color: "text-green-500",
      tooltip: "Average cost per successful call transfer.",
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* Top Buttons */}
      <div className="flex bg-white p-3 gap-4">
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

      <HeaderFilters />
      {activeModal === "dataCenter" && (
        <div className="p-6 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {metrics.map((m, i) => (
              <MetricCard key={i} {...m} />
            ))}
          </div>
          <div className="flex flex-col  gap-4 mb-8">
            <FunnelVisual />
            <PieChartsDashboard />
            {/* <BigCards /> */}
            <CallCharts />
          </div>
        </div>
      )}

      {activeModal === "callList" && <DownloadContact />}
    </div>
  );
};

export default CallDashboard;
