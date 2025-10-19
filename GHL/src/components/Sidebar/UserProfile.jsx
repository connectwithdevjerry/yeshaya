import React from 'react';
import { ChevronDown } from 'lucide-react';

export function UserProfile({ name, users }) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">{name.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{users} users</div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
