// src/components/components-ghl/Sidebar/Sidebar.jsx
import React from 'react';
import { UserProfile } from './UserProfile';
import { NavigationItem } from './NavigationItem';
import { BottomInfo } from './BottomInfo';

export function SidebarGHL({ userInfo, navigationItems }) {
  // ✅ Provide default values if props are missing
  const safeUserInfo = userInfo || {
    name: "Agency",
    users: "0",
    currentUser: {
      initial: "A",
      email: "user@agency.com"
    }
  };

  const safeNavigationItems = navigationItems || [];

  return (
    <div className="w-56 h-screen bg-[#0f172a] border-r border-slate-800 flex flex-col overflow-visible">
      <UserProfile 
        name={safeUserInfo.name} 
        users={safeUserInfo.users} 
      />

      <nav className="flex-1 px-4">
        {safeNavigationItems.map((item) => (
          <NavigationItem
            key={item.name}
            name={item.name}
            icon={item.icon}
            active={item.active}
            link={item.link}
            children={item.children}
          />
        ))}
      </nav>

      <BottomInfo currentUser={safeUserInfo.currentUser} />
    </div>
  );
}