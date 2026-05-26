// src/pages/NumbersPage.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Ban,
  Home,
  Upload,
  ShoppingCart,
  Loader2,
  Phone,
  MoreHorizontal,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import TabButton from "../../../components/components-ghl/TabButton";
import ImportNumberModal from "../../../components/components-ghl/Numbers/ImportNumber";
import BuyNumberModal from "../../../components/components-ghl/Numbers/BuyNumber";
import {
  fetchPurchasedNumbers,
  getVapiConnectionStatus,
} from "../../../store/slices/numberSlice";
import { fetchAssistants } from "../../../store/slices/assistantsSlice";
import NumbersActionsMenu from "../../../components/components-ghl/Numbers/NumberActionsMenu";

const Numbers = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [allPurchasedNumbers, setAllPurchasedNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMenuAccountId, setOpenMenuAccountId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuAnchorRef = useRef(null);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(window.location.search);
  const subaccountId = searchParams.get("subaccount");

  const { data: assistants } = useSelector((state) => state.assistants);
  const { vapiStatuses } = useSelector((state) => state.numbers);

  // Fetch assistants on mount
  useEffect(() => {
    if (subaccountId) {
      dispatch(fetchAssistants(subaccountId));
    }
  }, [dispatch, subaccountId]);

  // Fetch purchased numbers for all assistants
  useEffect(() => {
    const fetchAllNumbers = async () => {
      if (subaccountId && assistants.length > 0) {
        setLoading(true);
        try {
          const promises = assistants.map((assistant) =>
            dispatch(
              fetchPurchasedNumbers({
                subaccountId,
                assistantId: assistant.id,
              })
            ).unwrap()
          );

          const results = await Promise.all(promises);

          const combined = results.flatMap((numbers, index) =>
            numbers.map((num) => ({
              ...num,
              assistantId: assistants[index].id,
              assistantName: assistants[index].name,
            }))
          );

          // Remove duplicates based on phone number SID
          const uniqueNumbers = combined.reduce((acc, current) => {
            const exists = acc.find(
              (item) =>
                item.phoneNumberDetails?.sid === current.phoneNumberDetails?.sid
            );
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);

          setAllPurchasedNumbers(uniqueNumbers);
        } catch (error) {
          console.error("Error fetching numbers:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllNumbers();
  }, [dispatch, subaccountId, assistants]);

  // Check Vapi connection status for all numbers
  useEffect(() => {
    const checkVapiStatuses = async () => {
      console.log("🔍 Checking Vapi statuses...");
      console.log("📊 All Purchased Numbers:", allPurchasedNumbers.length);
      console.log("📊 Subaccount ID:", subaccountId);
      console.log("📊 Current vapiStatuses:", vapiStatuses);

      if (allPurchasedNumbers.length > 0 && subaccountId) {
        for (const numberItem of allPurchasedNumbers) {
          const details = numberItem.phoneNumberDetails;

          if (!details?.sid || !details?.phoneNumber) {
            console.log("⚠️ Skipping number with missing details");
            continue;
          }

          console.log("🔍 Checking number:", details.phoneNumber);

          try {
            console.log(
              `🚀 Fetching Vapi status for ${details.phoneNumber}...`
            );

            await dispatch(
              getVapiConnectionStatus({
                phoneNum: details.phoneNumber,
                subaccountId: subaccountId,
                assistantId: numberItem.assistantId,
                phoneSid: details.sid,
                number: details.phoneNumber,
              })
            );

            console.log(`✅ Status check completed for ${details.phoneNumber}`);
          } catch (error) {
            console.error(
              `❌ Failed to check Vapi status for ${details.phoneNumber}:`,
              error
            );
            // Don't stop checking other numbers if one fails
          }
        }
      }
    };

    if (allPurchasedNumbers.length > 0) {
      checkVapiStatuses();
    }
  }, [allPurchasedNumbers.length, subaccountId, dispatch]);

  const getFilteredNumbers = () => {
    switch (activeTab) {
      case "bought":
        return allPurchasedNumbers.filter(
          (num) => num.phoneNumberDetails?.origin === "twilio"
        );
      case "imported":
        return allPurchasedNumbers.filter(
          (num) => num.phoneNumberDetails?.origin !== "twilio"
        );
      case "all":
      default:
        return allPurchasedNumbers;
    }
  };

  const filteredNumbers = getFilteredNumbers();

  const headers = [
    "NAME",
    "NUMBER",
    "UPDATED",
    "CAPABILITIES",
    "STATUS",
    "LINKED ASSISTANT",
    "STATUS",
    "ACTIONS",
  ];

  // Helper function to format capabilities
  const formatCapabilities = (capabilities) => {
    if (!capabilities) return "N/A";
    const caps = [];
    if (capabilities.voice) caps.push("Voice");
    if (capabilities.sms) caps.push("SMS");
    if (capabilities.mms) caps.push("MMS");
    return caps.join(", ") || "N/A";
  };

  // Helper function to render Vapi status indicator
  const renderVapiStatus = (phoneSid) => {
    const vapiInfo = vapiStatuses[phoneSid];

    // No record at all -> Not Connected
    if (!vapiInfo) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <XCircle size={12} className="mr-1" />
          Not Connected
        </span>
      );
    }

    // If a check is in progress: show Checking...
    // We treat undefined isConnected as "still checking" if the object exists
    if (vapiInfo.checking || typeof vapiInfo.isConnected === "undefined") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Loader2 size={12} className="mr-1 animate-spin" />
          Checking...
        </span>
      );
    }

    // Only consider connected when isConnected === true
    const connected = vapiInfo.isConnected === true;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          connected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {connected ? (
          <>
            <CheckCircle size={12} className="mr-1" />
            Connected
          </>
        ) : (
          <>
            <XCircle size={12} className="mr-1" />
            Not Connected
          </>
        )}
      </span>
    );
  };

  const handleOpenActionMenu = (e, numberItem) => {
    e.stopPropagation();

    const details = numberItem.phoneNumberDetails;

    if (openMenuAccountId === details.sid) {
      setOpenMenuAccountId(null);
      return;
    }

    // Calculate button position relative to the viewport
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 350;
    const viewportHeight = window.innerHeight;
    let topPosition = rect.bottom + 5;

    if (topPosition + menuHeight > viewportHeight && rect.top > menuHeight) {
      topPosition = rect.top - menuHeight - 5;
    }

    setMenuPosition({
      top: topPosition,
      left: rect.right - 240,
    });

    // Create account object with proper structure for the menu
    const accountData = {
      id: details.sid,
      companyId: subaccountId,
      name: details.friendlyName || "Unknown Number",
      email: "",
      phoneNumber: details.phoneNumber,
      assistantId: numberItem.assistantId,
      assistantName: numberItem.assistantName,
    };

    setSelectedAccount(accountData);
    setOpenMenuAccountId(details.sid);
  };

  const handleCloseActionMenu = () => {
    setOpenMenuAccountId(null);
  };

  return (
    <div className="flex-grow bg-gray-50/60 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Phone Numbers</h1>
            <span className="bg-indigo-100 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {allPurchasedNumbers.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm"
            >
              <Upload className="w-4 h-4" /> Import Number
            </button>
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4" /> Buy Number
            </button>
          </div>
        </div>

        {/* ── Card with tabs + table ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 px-2 pt-2 gap-1">
            {[
              { id: "all",      label: "All",      count: allPurchasedNumbers.length },
              { id: "bought",   label: "Bought",   count: allPurchasedNumbers.filter(n => n.phoneNumberDetails?.origin === "twilio").length },
              { id: "imported", label: "Imported", count: allPurchasedNumbers.filter(n => n.phoneNumberDetails?.origin !== "twilio").length },
            ].map(({ id, label, count }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150
                    ${isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
                    ${isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}`}>
                    {count}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-gradient-to-r from-indigo-500 to-violet-600" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </div>
            <span>{filteredNumbers.length} / {allPurchasedNumbers.length} numbers</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  {headers.map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={headers.length} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-gray-500 text-sm">Loading numbers…</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredNumbers.length === 0 ? (
                  <tr>
                    <td colSpan={headers.length} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                          <Phone className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No numbers yet</p>
                        <p className="text-gray-400 text-sm">Import or buy a phone number to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredNumbers.map((item, index) => {
                    const details = item.phoneNumberDetails;
                    const uniqueKey = `${details.sid}-${index}`;
                    return (
                      <tr key={uniqueKey} className="hover:bg-indigo-50/30 transition-colors duration-150 group">
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                          {details.friendlyName || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-mono text-gray-600">
                          {details.phoneNumber || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">
                          {details.dateUpdated ? new Date(details.dateUpdated).toLocaleString() : "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {formatCapabilities(details.capabilities)}
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${details.status === "in-use" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {details.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-indigo-600 font-medium">
                          {item.assistantName || "N/A"}
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          {renderVapiStatus(details.sid)}
                        </td>
                        <td className="px-5 py-3.5 text-sm">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={e => { e.stopPropagation(); handleOpenActionMenu(e, item); }}
                              ref={openMenuAccountId === details.sid ? menuAnchorRef : null}
                              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                              aria-label="more"
                            >
                              <MoreHorizontal size={15} className="text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filteredNumbers.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <select className="pl-2 pr-6 py-1 border border-gray-200 rounded-lg text-xs focus:ring-indigo-500/20 focus:border-indigo-500 outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span>Showing {Math.min(10, filteredNumbers.length)} of {filteredNumbers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Page 1 of 1</span>
                <button className="p-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40" disabled>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40" disabled>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportNumberModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      <BuyNumberModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
      {openMenuAccountId && selectedAccount && (
        <NumbersActionsMenu
          isOpen={true}
          onClose={handleCloseActionMenu}
          account={selectedAccount}
          position={menuPosition}
          anchorRef={menuAnchorRef}
        />
      )}
    </div>
  );
};

export default Numbers;
