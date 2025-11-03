import React from 'react';
import { UserProfile } from './UserProfile';
import { NavigationItem } from './NavigationItem';
import { BottomInfo } from './BottomInfo';

export function SidebarGHL({ userInfo, navigationItems }) {
  return (
    <div className="w-56 h-screen bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <UserProfile name={userInfo.name} users={userInfo.users} />

      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
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

      <BottomInfo currentUser={userInfo.currentUser} />
    </div>
  );
}
