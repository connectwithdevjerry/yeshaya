import React from 'react';
import { UserProfile } from './UserProfile';
import { NavigationItem } from './NavigationItem';
import { BottomInfo } from './BottomInfo';

export function Sidebar({ userInfo, navigationItems }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <UserProfile name={userInfo.name} users={userInfo.users} />
      
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => (
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
        balance={userInfo.balance}
        numbers={userInfo.numbers}
        currentUser={userInfo.currentUser}
      />
    </div>
  );
}
