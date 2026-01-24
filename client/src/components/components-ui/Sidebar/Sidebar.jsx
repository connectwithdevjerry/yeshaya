// src/components/components-ui/Sidebar/Sidebar.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserProfile } from './UserProfile';
import { NavigationItem } from './NavigationItem';
import { BottomInfo } from './BottomInfo';
import { fetchWalletBalance } from '../../../store/slices/assistantsSlice';

export function Sidebar({ userInfo, navigationItems }) {
  const dispatch = useDispatch();
  
  // 1. Pull the walletBalance from Redux state
  const { walletBalance, fetchingBalance } = useSelector((state) => state.assistants);

  // 2. Fetch the balance when the Sidebar mounts
  useEffect(() => {
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  const safeUserInfo = userInfo || {
    name: "Agency",
    users: "0",
    numbers: 0,
    currentUser: {
      initial: "A",
      email: "user@agency.com",
    },
  };

  const safeNavigationItems = navigationItems || [];

  // 3. Format the balance for display
  // Logic: Use the Redux balance if available, otherwise fall back to userInfo or $0.00
  const displayBalance = fetchingBalance && !walletBalance 
    ? "Loading..." 
    : walletBalance !== null 
      ? `$${Number(walletBalance).toFixed(2)}` 
      : (userInfo?.balance || "$0.00");

  return (
    <div className=" overflow-visible w-56 h-screen left-0 top-0 bg-white border-r border-gray-200 flex flex-col">
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

      {/* 4. Pass the dynamic balance to BottomInfo */}
      <BottomInfo
        balance={displayBalance}
        numbers={safeUserInfo.numbers || 0}
        currentUser={safeUserInfo.currentUser}
      />
    </div>
  );
}