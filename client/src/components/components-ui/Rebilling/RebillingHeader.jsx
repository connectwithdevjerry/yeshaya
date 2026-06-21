// src/components/components-ui/Rebilling/RebillingHeader.jsx
import React from "react";
import { Settings, ArrowUpRight } from "lucide-react";
import { useSelector } from "react-redux";

const RebillingHeader = () => {
  const { companyDetails } = useSelector((s) => s.auth);
  const stripeConnected    = useSelector((s) => s.integrations?.stripe?.connected);

  const companyName    = companyDetails?.name  || "YashaYah AI";
  const companyLogo    = companyDetails?.logo;
  const companyInitial = (companyName).charAt(0).toUpperCase();

  const handleStripeSettings = () => {
    window.open("https://dashboard.stripe.com/settings", "_blank", "noopener,noreferrer");
  };

  const handleOpenStripe = () => {
    window.open("https://dashboard.stripe.com", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-4">
      {/* Agency avatar */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0 overflow-hidden">
        {companyLogo
          ? <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
          : companyInitial
        }
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-gray-900">{companyName}</h2>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border
            ${stripeConnected
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${stripeConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}`} />
            {stripeConnected ? "Stripe connected" : "Stripe not connected"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Acct · acct_1Q4Yx…aB2X · USD · Tier:{" "}
          <span className="font-semibold text-gray-700">Pro</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleStripeSettings}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <Settings className="w-3.5 h-3.5" />
          Stripe settings
        </button>
<<<<<<< HEAD
        <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowUpRight size={16} className="text-gray-500" />
=======
        <button
          onClick={handleOpenStripe}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          Open Stripe
>>>>>>> projects-ui
        </button>
      </div>
    </div>
  );
};

export default RebillingHeader;
