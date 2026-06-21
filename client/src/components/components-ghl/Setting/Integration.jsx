<<<<<<< HEAD
import React from 'react';
import { toast } from 'react-hot-toast';
=======
// src/components/components-ghl/Setting/Integration.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plug, CheckCircle2, XCircle, RefreshCw, Loader2,
  Clock, ShieldCheck, AlertCircle,
} from "lucide-react";
import { getSubaccountIdFromUrl } from "../../../utils/urlUtils";
import {
  fetchSubAccountDetails,
  authorizeGoHighLevel,
} from "../../../store/slices/integrationSlice";
>>>>>>> projects-ui

const Integration = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const subaccountId = getSubaccountIdFromUrl(searchParams);

  const { subAccountDetails, fetchingSubAccountDetails, goHighLevel } = useSelector(
    (s) => s.integrations || {}
  );

  useEffect(() => {
    if (subaccountId) dispatch(fetchSubAccountDetails(subaccountId));
  }, [dispatch, subaccountId]);

  const connected   = subAccountDetails?.connected;
  const tokenExpiry = subAccountDetails?.tokenExpiry;
  const expiryValid = tokenExpiry ? new Date(tokenExpiry).getTime() > Date.now() : false;

  const handleReconnect = () => {
    dispatch(authorizeGoHighLevel({
      accountId:        subaccountId,
      accountType:      "Company",
      installationType: "directInstallation",
    }));
  };

  if (!subaccountId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
        <p className="text-sm font-medium text-gray-600">No sub-account context</p>
        <p className="text-xs text-gray-400 mt-1">Open this page from within a sub-account.</p>
      </div>
    );
  }

  return (
<<<<<<< HEAD
   <div className="bg-slate-50 p-8 font-sans">
      
      {/* Main Card Container */}
      <div className="max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <header className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            CRM Integration
          </h2>
        </header>

        {/* Card Body */}
        <main className="p-6">
          
          {/* Inner Content Box */}
          <div className="border border-gray-200 rounded-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect to your CRM
            </h3>
            
            <ol className="list-decimal list-inside space-y-3 text-gray-600 text-sm mb-10">
              <li>
                Click the button to be taken to the connection page to sync your AI portal with your CRM.
              </li>
              <li>
                Select your account with the location ID you are matching to this account and allow all access for the AI to help manage your business.
              </li>
              <li>
                The connection will bring you back here when you are done.
              </li>
            </ol>

            {/* Action Link */}
            <div className="flex justify-end">
              <button 
                onClick={() => toast.success("Integration reset feature coming soon!")}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
               >
                Reset connection
              </button>
            </div>
          </div>
        </main>
=======
    <div className="space-y-6">
>>>>>>> projects-ui

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Plug className="w-5 h-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-800">CRM Connection</h3>
          <p className="text-xs text-gray-500">Manage this sub-account's GoHighLevel link.</p>
        </div>
      </div>

      {fetchingSubAccountDetails && !subAccountDetails ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* Connection status card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-5 ${
              connected ? "bg-emerald-50/40 border-emerald-100" : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                connected ? "bg-emerald-100" : "bg-gray-200"
              }`}>
                <img
                  src="https://canny-assets.io/icons/5b918f2630865c174eaa9483fdedac22.png"
                  alt="GHL"
                  className="w-6 h-6 object-contain rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">GoHighLevel</h4>
                  {connected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-semibold">
                      <XCircle className="w-3 h-3" /> Disconnected
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {connected
                    ? "This sub-account is synced with GoHighLevel."
                    : "Connect this sub-account to sync contacts, calendars, and workflows."}
                </p>
              </div>
            </div>

            {/* Token expiry */}
            {connected && tokenExpiry && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-emerald-100/60">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">
                  Access {expiryValid ? "valid until" : "expired on"}{" "}
                  <span className={`font-semibold ${expiryValid ? "text-gray-700" : "text-red-500"}`}>
                    {new Date(tokenExpiry).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </span>
              </div>
            )}
          </motion.div>

          {/* How it works */}
          <div className="rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-gray-800">How the connection works</h4>
            </div>
            <ol className="space-y-2.5">
              {[
                "Click reconnect to open the GoHighLevel authorization page.",
                "Select the location matching this sub-account and allow access.",
                "You'll be returned here once the connection completes.",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-gray-600 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={handleReconnect}
              disabled={goHighLevel?.loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-60"
            >
              {goHighLevel?.loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />}
              {connected ? "Reconnect" : "Connect to GoHighLevel"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Integration;
