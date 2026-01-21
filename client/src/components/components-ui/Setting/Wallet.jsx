import React, { useEffect, useState } from "react";
import {
  Settings,
  CreditCard,
  ChevronDown,
  Download,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2, // Added for loading state
} from "lucide-react";
import Card from "../ui/Card";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactionHistory } from "../../../store/slices/assistantsSlice";
import PaymentCardWidget from "./Wallet/PaymentCardWidget";
import AutopayToggle from "./Wallet/AutopayToggle";
import TransactionRow from "./Wallet/TransactionRow";

const WalletUsageContent = () => {
  const dispatch = useDispatch();
  
  // States for Filter/Search/Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { transactions = [], fetchingTransactions } = useSelector(
    (state) => state.assistants
  );

  useEffect(() => {
    dispatch(fetchTransactionHistory());
  }, [dispatch]);

  const filteredTransactions = React.useMemo(() => {
    const filtered = transactions.filter((tx) => {
      const matchesSearch = 
        tx.callId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = 
        filterType === "all" || 
        (filterType === "calls" && tx.type === "end-of-call-report") ||
        (filterType === "topups" && tx.type === "WALLET_TOPUP");

      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => 
      new Date(b.processedAt) - new Date(a.processedAt)
    );
  }, [transactions, searchTerm, filterType]);
  

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const currentItems = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <Card>
      <div className="flex flex-wrap lg:flex-nowrap gap-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
          <PaymentCardWidget />
        </div>

        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AutopayToggle />

          <div className="lg:col-span-1 p-4">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">
              ACTIONS
            </h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="flex items-center text-indigo-600 hover:text-indigo-800">
                <Settings className="w-4 h-4 mr-2" /> Edit Customer Information
              </a>
              <a href="#" className="flex items-center text-indigo-600 hover:text-indigo-800">
                <CreditCard className="w-4 h-4 mr-2" /> Update Card Info
              </a>
              <a href="#" className="flex items-center text-indigo-600 hover:text-indigo-800">
                <Download className="w-4 h-4 mr-2" /> Go To Portal
              </a>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4 pt-4 border-t">
        Transaction History
      </h3>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 p-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white">
            <Calendar className="w-4 h-4" />
            <span>Automatic (Last 30 Days)</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or type..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Type Dropdown Filter */}
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="calls">Calls Only</option>
              <option value="topups">Topups Only</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.5fr] gap-4 py-3 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div>Description</div>
        <div>Status</div>
        <div>Event ID</div>
        <div className="text-right">Amount</div>
      </div>

      {/* RESULTS LIST */}
      <div className="min-h-[400px]">
        {fetchingTransactions ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : currentItems.length > 0 ? (
          currentItems.map((tx) => {
            const dateObj = new Date(tx.processedAt);
            return (
              <TransactionRow
                key={tx._id}
                eventId={tx.callId}
                description={tx.type.split('-').join(' ').toUpperCase()}
                amount={tx.amount.toString()}
                date={dateObj.toLocaleDateString()}
                time={dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            );
          })
        ) : (
          <div className="py-20 text-center text-gray-500">
            No transactions found matching your criteria.
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium text-gray-500">{filteredTransactions.length} Results</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <div className="text-gray-500">Page {currentPage} of {totalPages || 1}</div>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 border rounded disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 border rounded disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WalletUsageContent;