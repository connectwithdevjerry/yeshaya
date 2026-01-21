import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Building2 } from 'lucide-react';
import { getCompanyDetails } from '../../../store/slices/authSlice';
import { fetchSubAccounts } from '../../../store/slices/integrationSlice';

export function UserProfile() {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get company details and subaccounts from Redux
  const { companyDetails, companyLoading } = useSelector((state) => state.auth);
  const { subAccounts, loading: subAccountsLoading } = useSelector((state) => state.integrations);

  // Fetch company details and subaccounts on mount
  useEffect(() => {
    dispatch(getCompanyDetails());
    dispatch(fetchSubAccounts());
  }, [dispatch]);

  // Extract values with fallbacks
  const companyName = companyDetails?.name || "Agency";
  const companyLogo = companyDetails?.logo;
  const initial = companyName.charAt(0).toUpperCase();
  const subAccountCount = subAccounts?.length || 0;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="p-4 border-b border-gray-200 relative">
      <div className="flex items-center space-x-3">
        {/* Company Logo Implementation */}
        <div className="w-10 h-10 border border-gray-100 rounded-full flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
          {companyLoading ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : companyLogo ? (
            <img 
              src={companyLogo} 
              alt={companyName} 
              className="w-full h-full object-cover"
            />
          ) : (
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
            {subAccountsLoading ? (
              'Loading...'
            ) : (
              `${subAccountCount} ${subAccountCount === 1 ? 'subaccount' : 'subaccounts'}`
            )}
          </div>
        </div>

        <button 
          onClick={toggleDropdown}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>
      </div>

      {/* Subaccounts Dropdown */}
      {isDropdownOpen && (
        <div className="absolute left-4 right-4 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {subAccountsLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Loading subaccounts...
            </div>
          ) : subAccounts && subAccounts.length > 0 ? (
            <div className="py-2">
              {subAccounts.map((subAccount) => (
                <div
                  key={subAccount.id}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {subAccount.name || subAccount.companyName || 'Unnamed Subaccount'}
                      </div>
                      {subAccount.id && (
                        <div className="text-xs text-gray-500 truncate">
                          ID: {subAccount.id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No subaccounts found
            </div>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}