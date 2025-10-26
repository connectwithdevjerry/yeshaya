// src/pages/SettingsPage.jsx
import React, { useState } from "react";
import { Settings, Globe, Layers, Shield } from "lucide-react";
import BrandingTab from "../components/Agency/BrandingTab";
import DomainTab from "../components/Agency/DomainTab";
import SnapshotTab from "../components/Agency/SnapShotTab";
import AdminTab from "../components/Agency/AdminTab";

const tabs = [
  { id: "branding", label: "Branding", icon: Settings },
  { id: "domain", label: "Domain", icon: Globe },
  { id: "snapshot", label: "Snapshot", icon: Layers },
  { id: "admin", label: "Admin", icon: Shield },
];

function Agency() {
  const [activeTab, setActiveTab] = useState("branding");

  return (
    <div className=" bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm">
        {/* Tabs */}
        <div className="border-b flex flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === id
                    ? "border-blue-600 text-blue-600 bg-gray-100"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {activeTab === "branding" && <BrandingTab />}
          {activeTab === "domain" && <DomainTab />}
          {activeTab === "snapshot" && <SnapshotTab />}
          {activeTab === "admin" && <AdminTab />}
        </div>
      </div>
    </div>
  );
}

export default Agency;
