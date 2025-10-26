import React, { useState } from "react";
import FeaturesTab from "./SnapShot/FeaturesTab";
import ReBillingTab from "./SnapShot/ReBillingTab";
import ResourcesTab from "./SnapShot/Resources";
import LimitsTab from "./SnapShot/Limits";

export default function SnapshotSettingsPage() {
  const [activeTab, setActiveTab] = useState("Features");

  const tabs = ["Features", "Re-Billing", "Resources", "Limits"];

  const renderTab = () => {
    switch (activeTab) {
      case "Features":
        return <FeaturesTab />;
      case "Re-Billing":
        return <ReBillingTab />;
      case "Resources":
        return <ResourcesTab />;
      case "Limits":
        return <LimitsTab />;
      default:
        return null;
    }
  };

  return (
    <div className=" bg-gray-50 p-4 md:p-8 text-gray-800">
      <h1 className="text-sm font-semibold text-gray-500 mb-2">
        SNAPSHOT FOR NEW ACCOUNTS
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
        {renderTab()}
      </div>
    </div>
  );
}
