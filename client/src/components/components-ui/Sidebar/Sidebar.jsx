// src/components/components-ui/Sidebar/Sidebar.jsx
import React from 'react';
import { UserProfile } from './UserProfile';
import { NavigationItem } from './NavigationItem';
import { BottomInfo } from './BottomInfo';

export function Sidebar({ userInfo, navigationItems }) {
  const safeUserInfo = userInfo || {
    name: "Agency",
    users: "0",
    balance: "$0.00",
    numbers: 0,
    currentUser: {
      initial: "A",
      email: "user@agency.com",
    },
  };

  const safeNavigationItems = navigationItems || [];

  return (
    <div className="w-56 h-screen left-0 top-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <UserProfile
        name={safeUserInfo.name}
        users={safeUserInfo.users}
      />
      
      <nav className="flex-1 p-4 space-y-1">
        {safeNavigationItems.map((item) => (
          <NavigationItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            active={item.active}
            link={item.link}
          />
        ))}
      </nav>

      <BottomInfo
        balance={safeUserInfo.balance || "$0.00"}
        numbers={safeUserInfo.numbers || 0}
        currentUser={safeUserInfo.currentUser}
      />
    </div>
  );
}