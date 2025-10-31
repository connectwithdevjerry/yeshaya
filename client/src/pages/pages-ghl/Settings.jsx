// src/pages/SettingsPage.jsx

import React, { useState } from "react";

// Import Feature Components
import AccountSettings from "../../components/components-ghl/Setting/Account.jsx";
import WorkspaceSettings from "../../components/components-ghl/Setting/WorkSpace.jsx";
import MembersSettings from "../../components/components-ghl/Setting/Members.jsx";
import Integration from "../../components/components-ghl/Setting/Integration.jsx";

const TopTabButton = ({ isActive, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
      isActive ? "bg-gray-100 border" : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const GHLSettings = () => {
  const [activeTopTab, setActiveTopTab] = useState("account"); // 'account', 'workspace', 'members', 'billing'

  let content;
  switch (activeTopTab) {
    case "workspace":
      content = <WorkspaceSettings />;
      break;
    case "members":
      content = <MembersSettings />;
      break;
    case "integration":
      content = <Integration />;
      break;
    case "account":
    default:
      content = <AccountSettings />;
      break;
  }

  return (
    <div className=" bg-gray-50">
      <div className=" mx-auto">
        {/* Top-level Tabs Navigation */}
        <div className="flex space-x-2 mb-6 py-3 bg-white">
          <TopTabButton
            isActive={activeTopTab === "account"}
            onClick={() => setActiveTopTab("account")}
          >
            Account
          </TopTabButton>
          <TopTabButton
            isActive={activeTopTab === "workspace"}
            onClick={() => setActiveTopTab("workspace")}
          >
            Workspace
          </TopTabButton>
          <TopTabButton
            isActive={activeTopTab === "members"}
            onClick={() => setActiveTopTab("members")}
          >
            Members
          </TopTabButton>
          <TopTabButton
            isActive={activeTopTab === "integration"}
            onClick={() => setActiveTopTab("integration")}
          >
            Integrations
          </TopTabButton>
        </div>

        <div className="flex justify-center">
          {/* Tab Content Area */}
          {content}
        </div>
      </div>
    </div>
  );
};

export default GHLSettings;
