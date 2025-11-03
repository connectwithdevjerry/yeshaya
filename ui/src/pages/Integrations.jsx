// src/pages/SettingsPage.jsx

import React, { useState } from 'react';
import { Key, Plug, CreditCard, Settings, Lock, Phone, MessageCircle } from 'lucide-react';

// Import Feature Components
import IntegrationsContent from '../components/Integration/Integrations.jsx';
import APIKeysContent from '../components/Integration/Api.jsx';
import WebhooksContent from '../components/Integration/Webhooks.jsx';



// Shared Components
const TabButton = ({ isActive, children, onClick }) => (
  <button
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 border-b-2 border-indigo-600'
        : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('integrations'); // 'integrations', 'apiKeys', 'webhooks'

  let content;
  switch (activeTab) {
    case 'apiKeys':
      content = <APIKeysContent />;
      break;
    case 'webhooks':
      content = <WebhooksContent />;
      break;
    case 'integrations':
    default:
      content = <IntegrationsContent />;
      break;
  }

  return (
    <div className=" bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm p-0">
          <TabButton isActive={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')}>
            Integrations
          </TabButton>
          <TabButton isActive={activeTab === 'apiKeys'} onClick={() => setActiveTab('apiKeys')}>
            API Keys
          </TabButton>
          <TabButton isActive={activeTab === 'webhooks'} onClick={() => setActiveTab('webhooks')}>
            Webhooks
          </TabButton>
        </div>

        {/* Tab Content Area */}
        {content}
      </div>
    </div>
  );
};

export default Integrations;