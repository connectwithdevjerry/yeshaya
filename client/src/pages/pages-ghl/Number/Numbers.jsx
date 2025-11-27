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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import TabButton from "../../../components/components-ghl/TabButton";
import ImportNumberModal from "../../../components/components-ghl/Numbers/ImportNumber";
import BuyNumberModal from "../../../components/components-ghl/Numbers/BuyNumber";
import { fetchPurchasedNumbers } from "../../../store/slices/numberSlice";
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

          setAllPurchasedNumbers(combined);
        } catch (error) {
          console.error("Error fetching numbers:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllNumbers();
  }, [dispatch, subaccountId, assistants]);

  // Filter numbers based on active tab
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
      companyId: subaccountId, // Use the subaccount ID from URL params
      name: details.friendlyName || "Unknown Number",
      email: "", // Numbers don't have emails
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
    <div className="flex-grow bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center space-x-3">
            {/* Import Number Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" /> Import a Number
            </button>

            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md shadow-md hover:bg-gray-800 transition-colors flex items-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Buy a Number
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-sm">
          <TabButton
            isActive={activeTab === "all"}
            onClick={() => setActiveTab("all")}
          >
            All {allPurchasedNumbers.length}
          </TabButton>
          <TabButton
            isActive={activeTab === "bought"}
            onClick={() => setActiveTab("bought")}
          >
            Bought{" "}
            {
              allPurchasedNumbers.filter(
                (n) => n.phoneNumberDetails?.origin === "twilio"
              ).length
            }
          </TabButton>
          <TabButton
            isActive={activeTab === "imported"}
            onClick={() => setActiveTab("imported")}
          >
            Imported{" "}
            {
              allPurchasedNumbers.filter(
                (n) => n.phoneNumberDetails?.origin !== "twilio"
              ).length
            }
          </TabButton>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm font-medium text-gray-600 mb-4 flex items-center space-x-2">
          <Home className="w-4 h-4" />
          <span>Home</span>
          <span className="ml-auto text-gray-400">
            {filteredNumbers.length} / {allPurchasedNumbers.length}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
                      <span className="text-gray-600">
                        Loading purchased numbers...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredNumbers.length === 0 ? (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Ban className="w-8 h-8 text-gray-400 mb-2" />
                      No numbers to display
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNumbers.map((item, index) => {
                  const details = item.phoneNumberDetails;

                  return (
                    <tr key={details.sid || index} className="hover:bg-gray-50">
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {details.friendlyName || "N/A"}
                      </td>

                      {/* Number */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {details.phoneNumber || "N/A"}
                      </td>

                      {/* Updated */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {details.dateUpdated
                          ? new Date(details.dateUpdated).toLocaleString()
                          : "N/A"}
                      </td>

                      {/* Capabilities */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCapabilities(details.capabilities)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            details.status === "in-use"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {details.status || "N/A"}
                        </span>
                      </td>

                      {/* Linked Assistant */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                        {item.assistantName || "N/A"}
                      </td>

                      {/* ACTIONS - fixed width, center vertically & horizontally */}
                      <td className="p-3 align-middle w-40">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenActionMenu(e, item); 
                            }}
                            ref={
                              openMenuAccountId === details.sid
                                ? menuAnchorRef
                                : null
                            }
                            className="p-2 border rounded-md hover:bg-gray-100"
                            aria-label="more"
                            title="More"
                          >
                            <MoreHorizontal
                              size={16}
                              className="text-gray-500"
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="p-2 border rounded-md bg-red-50 hover:bg-red-200"
                            aria-label="delete"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-400" />
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

        {/* Pagination */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <div className="relative">
              <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
            <span>Showing 1-{Math.min(10, filteredNumbers.length)}</span>
            <span className="font-medium text-gray-500">
              {filteredNumbers.length} Results
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="text-gray-500">Page 1 of 1</div>
            <button
              className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              disabled
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
