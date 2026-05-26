import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, Building2 } from 'lucide-react';
import { getCompanyDetails } from '../../../store/slices/authSlice';
import { fetchSubAccounts } from '../../../store/slices/integrationSlice';
import { AnimatePresence, motion } from 'framer-motion';

export function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { companyDetails, companyLoading } = useSelector((state) => state.auth);
  const { subAccounts, loading: subAccountsLoading } = useSelector((state) => state.integrations);

  useEffect(() => {
    dispatch(getCompanyDetails());
    dispatch(fetchSubAccounts());
  }, [dispatch]);

  const companyName = companyDetails?.name || "Agency";
  const companyLogo = companyDetails?.logo;
  const initial = companyName.charAt(0).toUpperCase();
  const subAccountCount = subAccounts?.length || 0;

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSubAccountClick = (subAccount) => {
    try {
      let targetRoute = "/assistants";

      if (location.pathname === "/app") {
        targetRoute = searchParams.get("route") || "/assistants";
      } else if (
        [
          "/inbox", "/call", "/contacts", "/knowledge", "/assistants",
          "/activetags", "/numbers", "/pools", "/widgets", "/helps",
          "/ghl_settings", "/blog",
        ].includes(location.pathname)
      ) {
        targetRoute = location.pathname;
      }

      const params = new URLSearchParams({
        agencyid: companyDetails?.id || companyDetails?.companyId || "UNKNOWN_COMPANY",
        subaccount: subAccount.id || "NO_ID",
        allow: "yes",
        myname: subAccount.name || subAccount.companyName || "NoName",
        myemail: subAccount.email || "noemail@example.com",
        route: targetRoute,
      });

      setIsDropdownOpen(false);
      setTimeout(() => navigate(`/app?${params.toString()}`), 0);
    } catch (err) {
      console.error("❌ Navigation error:", err);
    }
  };

  return (
    <div className="p-4 border-b border-slate-800 relative">
      <div className="flex items-center space-x-3">
        {/* Company Logo */}
        <div className="w-10 h-10 border border-slate-700 rounded-full flex items-center justify-center overflow-hidden bg-slate-800 flex-shrink-0">
          {companyLoading ? (
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          ) : companyLogo ? (
            <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-indigo-400">{initial}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{companyName}</div>
          <div className="text-xs text-slate-400">
            {subAccountsLoading ? 'Loading...' : `${subAccountCount} ${subAccountCount === 1 ? 'subaccount' : 'subaccounts'}`}
          </div>
        </div>

        <button
          onClick={toggleDropdown}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      {/* Subaccounts Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-4 right-4 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto sidebar-scroll"
          >
            {subAccountsLoading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Loading subaccounts...</div>
            ) : subAccounts && subAccounts.length > 0 ? (
              <div className="py-2">
                {subAccounts.map((subAccount) => (
                  <div
                    key={subAccount.id}
                    onClick={() => handleSubAccountClick(subAccount)}
                    className="px-4 py-2 hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {subAccount.name || subAccount.companyName || 'Unnamed Subaccount'}
                        </div>
                        {subAccount.id && (
                          <div className="text-xs text-slate-500 truncate">ID: {subAccount.id}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">No subaccounts found</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
}
