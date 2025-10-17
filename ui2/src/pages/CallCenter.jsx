import React, { useState, useEffect } from "react";
import HeaderFilters from "../components/CallCenter/HeadFilters";
import MetricCard from "../components/CallCenter/MetricCard";
import SummaryStats from "../components/CallCenter/SummaryStats";
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

const CallDashboard = () => {
  const [data, setData] = useState({});
  const [activeModal, setActiveModal] = useState(null); 
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(dummyCallData);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { label: "Total Calls", value: data.totalCalls, icon: <Phone />, color: "text-blue-500" },
    { label: "Outbound Calls", value: data.outboundCalls, icon: <PhoneOutgoing />, color: "text-green-500" },
    { label: "Inbound Calls", value: data.inboundCalls, icon: <PhoneIncoming />, color: "text-yellow-500" },
    { label: "Web Calls", value: data.webCalls, icon: <Globe />, color: "text-purple-500" },
    { label: "Cost Per Dial", value: `$${data.costPerDial?.toFixed(2)}`, icon: <DollarSign />, color: "text-red-500" },
    { label: "Contact Ends", value: data.contactEnds, icon: <User />, color: "text-amber-600" },
    { label: "AI Ends", value: data.aiEnds, icon: <Cpu />, color: "text-amber-700" },
    { label: "Voicemails", value: data.voicemails, icon: <Voicemail />, color: "text-amber-800" },
    { label: "Transfers", value: data.transfers, icon: <ArrowLeftRight />, color: "text-teal-600" },
    { label: "Appointments", value: data.appointments, icon: <Calendar />, color: "text-emerald-600" },
    { label: "Total Call Time", value: `${data.totalCallTime} mins`, icon: <Clock />, color: "text-orange-500" },
    { label: "Avg Call Time", value: `${data.avgCallTime} mins`, icon: <Timer />, color: "text-sky-500" },
    { label: "Total Spend", value: `$${data.totalSpend?.toFixed(2)}`, icon: <Wallet />, color: "text-rose-500" },
    { label: "Cost Per Booked Appointment", value: `$${data.costPerBookedAppointment?.toFixed(2)}`, icon: <DollarSign />, color: "text-green-700" },
    { label: "Cost Per Transfer", value: `$${data.costPerTransfer?.toFixed(2)}`, icon: <DollarSign />, color: "text-green-500" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
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

      {/* Modal 1: Data Center */}
      {activeModal === "dataCenter" && (
        <div className="p-6 animate-fadeIn">
          <HeaderFilters />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {metrics.map((m, i) => (
              <MetricCard key={i} {...m} />
            ))}
          </div>
          <SummaryStats data={data} />
        </div>
      )}

      {/* Modal 2: Call List */}
      {activeModal === "callList" && (
        <div className="p-6 animate-fadeIn">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">📞 Call List</h2>
            <p className="text-gray-600 text-sm">
              This is where your call list data or table will appear.  
              You can add a table, pagination, or API integration here.
            </p>
            <div className="mt-4 border-t pt-4 text-sm text-gray-500">
              (Currently showing dummy modal for "Call List")
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallDashboard;
