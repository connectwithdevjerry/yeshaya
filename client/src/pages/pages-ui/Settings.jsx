import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AccountSettings from "../../components/components-ui/Setting/Account.jsx";
import WorkspaceSettings from "../../components/components-ui/Setting/WorkSpace.jsx";
import MembersSettings from "../../components/components-ui/Setting/Members.jsx";
import BillingSettings from "../../components/components-ui/Setting/Billing.jsx";

const TopTabButton = ({ isActive, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
      isActive
        ? "text-indigo-600 bg-white shadow-sm"
        : "text-gray-500 hover:text-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Settings = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tabParam = params.get("tab");

  const [activeTopTab, setActiveTopTab] = useState(tabParam || "account");

  // Update tab if URL changes
  useEffect(() => {
    if (tabParam) setActiveTopTab(tabParam);
  }, [tabParam]);

  let content;
  switch (activeTopTab) {
    case "workspace":
      content = <WorkspaceSettings />;
      break;
    case "members":
      content = <MembersSettings />;
      break;
    case "billing":
      content = <BillingSettings />;
      break;
    case "account":
    default:
      content = <AccountSettings />;
      break;
  }

  return (
    <div className="bg-gray-50 p-8">
      <div className="mx-auto">
        <div className="flex space-x-2 mb-6">
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
            isActive={activeTopTab === "billing"}
            onClick={() => setActiveTopTab("billing")}
          >
            Billing
          </TopTabButton>
        </div>

        {content}
      </div>
    </div>
  );
};

export default Settings;
