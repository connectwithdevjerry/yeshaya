import React from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, Building2 } from 'lucide-react';

export function UserProfile({ users }) {
  // 1. Pull the live company details from Redux
  const { companyDetails } = useSelector((state) => state.auth);

  // 2. Extract values with fallbacks
  const companyName = companyDetails?.name || "Agency";
  const companyLogo = companyDetails?.logo;
  const initial = companyName.charAt(0).toUpperCase();

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        {/* Company Logo Implementation */}
        <div className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
          {companyLogo ? (
            <img 
              src={companyLogo} 
              alt={companyName} 
              className="w-full h-full object-cover"
            />
          ) : (
            // Fallback to Icon or Initial if no logo exists
            <span className="text-sm font-bold text-indigo-600">
              {initial}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {companyName}
          </div>
          <div className="text-xs text-gray-500">
            {users || 0} users
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}