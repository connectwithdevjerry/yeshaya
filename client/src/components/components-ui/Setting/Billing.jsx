// src/components/BillingSettings.jsx (Updated)

import React, { useState } from 'react';
import Card from '../ui/Card';
import { Download } from 'lucide-react'; 
import WalletUsageContent from './Wallet'; // <-- Import the new component

const SubTabButton = ({ isActive, children, onClick }) => (
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

const SubscriptionsContent = () => {
  // Mock data for subscriptions
  const subscriptions = [
    { name: 'Platform Phone Numbers', quantity: 1, price: 2.50, unit: 'mo' },
    { name: 'Voice knowledge base', quantity: 0, price: 0.00, unit: 'mo' },
  ];

  return (
    <div className="mt-4">
      {subscriptions.map((sub, index) => (
        <div key={index} className="flex justify-between items-center py-3 border-b last:border-b-0">
          <div className="flex items-center">
            <span className="text-base font-medium text-gray-800">
              {sub.name} x {sub.quantity}
            </span>
            {sub.name === 'Platform Phone Numbers' && (
              <button className="ml-4 flex items-center text-indigo-600 hover:text-indigo-800 text-sm">
                <Download className="w-4 h-4 mr-1" /> Download as CSV
              </button>
            )}
          </div>
          <span className="text-base font-semibold text-gray-800">
            ${sub.price.toFixed(2)} / {sub.unit}
          </span>
        </div>
      ))}
    </div>
  );
};

const BillingSettings = () => {
  const [activeSubTab, setActiveSubTab] = useState('walletUsage'); // Changed default to show new content

  return (
    <Card>
      {/* Sub-Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6 -mx-6 px-6">
        <SubTabButton isActive={activeSubTab === 'subscriptions'} onClick={() => setActiveSubTab('subscriptions')}>
          Subscriptions
        </SubTabButton>
        <SubTabButton isActive={activeSubTab === 'walletUsage'} onClick={() => setActiveSubTab('walletUsage')}>
          Wallet & Usage
        </SubTabButton>
      </div>

      {/* Conditional Rendering */}
      {activeSubTab === 'subscriptions' && <SubscriptionsContent />}
      {activeSubTab === 'walletUsage' && <WalletUsageContent />}
    </Card>
  );
};

export default BillingSettings;