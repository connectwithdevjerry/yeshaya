// src/pages/SettingsPage.jsx

import React, { useState } from 'react';

// Import Feature Components
import AccountSettings from '../components/Setting/Account.jsx';
import WorkspaceSettings from '../components/Setting/WorkSpace.jsx';
import MembersSettings from '../components/Setting/Members.jsx';
import BillingSettings from '../components/Setting/Billing.jsx';

// Shared Components (can be placed in a common file if desired)
const TopTabButton = ({ isActive, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
      isActive
        ? 'text-indigo-600 bg-white shadow-sm'
        : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Settings = () => {
  const [activeTopTab, setActiveTopTab] = useState('account'); // 'account', 'workspace', 'members', 'billing'

  let content;
  switch (activeTopTab) {
    case 'workspace':
      content = <WorkspaceSettings />;
      break;
    case 'members':
      content = <MembersSettings />;
      break;
    case 'billing':
      content = <BillingSettings />;
      break;
    case 'account':
    default:
      content = <AccountSettings />;
      break;
  }

  return (
    <div className=" bg-gray-50 p-8">
      <div className=" mx-auto">
        {/* Top-level Tabs Navigation */}
        <div className="flex space-x-2 mb-6">
          <TopTabButton isActive={activeTopTab === 'account'} onClick={() => setActiveTopTab('account')}>
            Account
          </TopTabButton>
          <TopTabButton isActive={activeTopTab === 'workspace'} onClick={() => setActiveTopTab('workspace')}>
            Workspace
          </TopTabButton>
          <TopTabButton isActive={activeTopTab === 'members'} onClick={() => setActiveTopTab('members')}>
            Members
          </TopTabButton>
          <TopTabButton isActive={activeTopTab === 'billing'} onClick={() => setActiveTopTab('billing')}>
            Billing
          </TopTabButton>
        </div>

        {/* Tab Content Area */}
        {content}
      </div>
    </div>
  );
};

export default Settings;