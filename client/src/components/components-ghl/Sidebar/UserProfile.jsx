// src/components/components-ghl/Sidebar/UserProfile.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrentAccount } from '../../../hooks/useCurrentAccount';
import { useNavigate } from 'react-router-dom';

export function UserProfile({ name = "Agency", users = "0" }) {
  const [isOpen, setIsOpen] = useState(false);
  const account = useCurrentAccount();
  const navigate = useNavigate();

  const handleBackToAccounts = () => {
    navigate('/');
  };

  // ✅ Show account name if we're in account context
  const displayName = account ? decodeURIComponent(account.myname || name) : name;
  const displaySubtext = account 
    ? `Sub-account: ${(account.subaccount || '').slice(0, 8)}...` 
    : `${users} users`;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {(displayName || 'A').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
          <div className="text-xs text-gray-500 truncate">{displaySubtext}</div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* ✅ Dropdown menu for account actions */}
      {isOpen && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {account && (
            <>
              <div className="px-3 py-2 text-xs text-gray-500 border-b">
                <p className="font-semibold">Account Info</p>
                <p className="truncate">Agency: {(account.agencyid || '').slice(0, 10)}...</p>
                <p className="truncate">Email: {decodeURIComponent(account.myemail || '')}</p>
              </div>
              <button
                onClick={handleBackToAccounts}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                ← Back to Accounts
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}