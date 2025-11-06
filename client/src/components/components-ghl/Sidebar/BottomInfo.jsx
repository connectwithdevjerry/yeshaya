// src/components/components-ghl/Sidebar/BottomInfo.jsx
import React, { useState } from 'react';
import { Settings, HelpCircle, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserMenuPopup from '../UserMenu';
import { useCurrentAccount } from '../../../hooks/useCurrentAccount';

export function BottomInfo({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Provide default values
  const safeCurrentUser = currentUser || {
    initial: "U",
    email: "user@example.com"
  };

  // ✅ Handle settings navigation
  const handleSettingsClick = () => {
    if (location.pathname === '/app' && account) {
      const params = new URLSearchParams({
        agencyid: account.agencyid,
        subaccount: account.subaccount,
        allow: account.allow || 'yes',
        myname: account.myname,
        myemail: account.myemail,
        route: '/ghl_settings',
      });
      navigate(`/app?${params.toString()}`);
    } else {
      navigate('/settings');
    }
  };

  const handleHelpClick = () => {
    if (location.pathname === '/app' && account) {
      const params = new URLSearchParams({
        agencyid: account.agencyid,
        subaccount: account.subaccount,
        allow: account.allow || 'yes',
        myname: account.myname,
        myemail: account.myemail,
        route: '/helps',
      });
      navigate(`/app?${params.toString()}`);
    } else {
      navigate('/helps');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 space-y-3">
      {/* ✅ Show account indicator if in account context */}
      {account && (
        <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-700">
              Account Connected
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1 truncate">
            {decodeURIComponent(account.myname || 'Account')}
          </p>
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={handleSettingsClick}
        className="flex items-center space-x-2 px-3 py-2 w-full rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Settings className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700">Settings</span>
      </button>

      {/* Help Button */}
      <button
        onClick={handleHelpClick}
        className="flex items-center space-x-2 px-3 py-2 w-full rounded-lg hover:bg-gray-100 transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-700">Help</span>
      </button>

      {/* User Menu */}
      <div className="relative">
        <div
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 cursor-pointer rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
            {safeCurrentUser.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-900">Current user</div>
            <div className="text-xs text-gray-500 truncate">{safeCurrentUser.email}</div>
          </div>
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </div>
        
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-full">
            <UserMenuPopup />
          </div>
        )}
      </div>
    </div>
  );
}