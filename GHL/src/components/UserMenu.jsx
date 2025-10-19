// src/components/UserMenuPopup.jsx

import React from 'react';
import { User, LogOut, Settings, Info, Wifi, Mail, Phone, Lock } from 'lucide-react'; 

// --- Sub-Components ---

const UserMenuItem = ({ icon: Icon, label, link = '#' }) => (
  <a 
    href={link} 
    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
  >
    <Icon className="w-5 h-5 mr-3 text-indigo-600" />
    <span className="font-medium">{label}</span>
  </a>
);

const UserMenuPopup = () => {
  return (
    <div className="w-[300px] bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden text-sm">
      
      {/* 1. User Info Header */}
      <div className="flex items-center p-4 border-b border-gray-200">
        {/* Placeholder for Avatar/Initials */}
        <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-600 font-bold rounded-full mr-3">
          AI
        </div>
        <div>
          <div className="font-semibold text-gray-800">Current user</div>
          <div className="text-xs text-gray-500">kenny@mail.yashayah.ai</div>
        </div>
      </div>

      {/* 2. Service Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center text-green-600 font-medium">
          <Wifi className="w-4 h-4 mr-2" />
          All services are active
        </div>
      </div>

      {/* 3. Account Actions */}
      <div className="py-2 border-b border-gray-200">
        <UserMenuItem icon={User} label="Your Account" link="/settings" />
      </div>

      {/* 4. App Version Info */}
      <div className="p-3 text-gray-500 border-b border-gray-200">
        <div className="text-xs font-semibold uppercase mb-1">APP VERSION</div>
        <div className="text-sm">3.0.0 (Build 2025.06.27)</div>
      </div>

      {/* 5. Logout */}
      <div className="py-2 border-b border-gray-200">
        <UserMenuItem icon={LogOut} label="Log out" link="/logout" />
      </div>
    </div>
  );
};

export default UserMenuPopup;