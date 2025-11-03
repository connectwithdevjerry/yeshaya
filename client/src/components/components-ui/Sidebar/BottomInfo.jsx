import React from 'react';
import { Settings, HelpCircle, CreditCard, Phone, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserMenuPopup from '../UserMenu';
import { useState } from 'react';

export function BottomInfo({ balance, numbers, currentUser }) {

   const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 border-t border-gray-200 space-y-3">
      <Link to='/settings' className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full">
        <Settings className="w-5 h-5" />
        <span className="text-sm font-medium">Settings</span>
      </Link>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Balance</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{balance}</span>
        </div>
        
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Numbers</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900">{numbers}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 cursor-pointer rounded-lg" onClick={() => setIsOpen(!isOpen)}>
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
          {currentUser.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-900">Current user</div>
          <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
        </div>
        <ChevronLeft className="w-4 h-4 text-gray-400" />
      </div>
      {isOpen && (
        <div 
          className="absolute bottom-20 left-0 mb-2" 
          // Adjust positioning (bottom-full, right-0, etc.) based on where the trigger is.
          // This example places the menu above the trigger.
        >
          <UserMenuPopup />
        </div>
      )}
    </div>

    
  );
}