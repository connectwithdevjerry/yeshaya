// src/components/components-ghl/Sidebar/UserProfile.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrentAccount } from '../../../hooks/useCurrentAccount';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export function UserProfile({ name = "Agency", users = "0" }) {
  const [isOpen, setIsOpen] = useState(false);
  const account = useCurrentAccount();
  const navigate = useNavigate();

  const handleBackToAccounts = () => navigate('/');

  const displayName = account ? decodeURIComponent(account.myname || name) : name;
  const displaySubtext = account
    ? `Sub-account: ${(account.subaccount || '').slice(0, 8)}...`
    : `${users} users`;

  return (
    <div className="p-4 border-b border-slate-800">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-slate-300">
            {(displayName || 'A').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{displayName}</div>
          <div className="text-xs text-slate-400 truncate">{displaySubtext}</div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl py-1 z-50"
          >
            {account && (
              <>
                <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">
                  <p className="font-semibold text-slate-300">Account Info</p>
                  <p className="truncate mt-0.5">Agency: {(account.agencyid || '').slice(0, 10)}...</p>
                  <p className="truncate">Email: {decodeURIComponent(account.myemail || '')}</p>
                </div>
                <button
                  onClick={handleBackToAccounts}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  ← Back to Accounts
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
