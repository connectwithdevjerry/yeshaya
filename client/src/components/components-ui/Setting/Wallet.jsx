// src/components/components-ui/Setting/Wallet.jsx
import React, { useEffect, useState } from "react";
import {
  Settings, CreditCard, Download,
  Search, ChevronDown, ChevronLeft, ChevronRight, Loader2, ReceiptText,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactionHistory } from "../../../store/slices/assistantsSlice";
import PaymentCardWidget from "./Wallet/PaymentCardWidget";
import AutopayToggle     from "./Wallet/AutopayToggle";
import TransactionRow    from "./Wallet/TransactionRow";

const selectCls =
  "appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";

const WalletUsageContent = () => {
  const dispatch = useDispatch();

  const [searchTerm,   setSearchTerm]   = useState("");
  const [filterType,   setFilterType]   = useState("all");
  const [currentPage,  setCurrentPage]  = useState(1);
  const itemsPerPage = 10;

  const { transactions = [], fetchingTransactions } = useSelector((s) => s.assistants);

  useEffect(() => { dispatch(fetchTransactionHistory()); }, [dispatch]);

  const filtered = React.useMemo(() => {
    const q = searchTerm.toLowerCase();
    return [...transactions]
      .filter((tx) => {
        const matchSearch = tx.callId?.toLowerCase().includes(q) || tx.type?.toLowerCase().includes(q);
        const matchType   =
          filterType === "all"    ||
          (filterType === "calls"  && tx.type === "end-of-call-report") ||
          (filterType === "topups" && tx.type === "WALLET_TOPUP");
        return matchSearch && matchType;
      })
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));
  }, [transactions, searchTerm, filterType]);

  const totalPages   = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);

  return (
    <div className="space-y-6">

      {/* Wallet + Autopay row */}
      <div className="flex flex-wrap lg:flex-nowrap gap-4">
        <div className="flex-shrink-0">
          <PaymentCardWidget />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AutopayToggle />
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</p>
            {[
              { icon: Settings,   label: "Edit Customer Info"  },
              { icon: CreditCard, label: "Update Card Info"    },
              { icon: Download,   label: "Go To Portal"        },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-800">Transaction History</h3>
            <span className="text-xs text-gray-400">({filtered.length} results)</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID or type…"
                className="pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm w-52 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
              />
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className={selectCls}
              >
                <option value="all">All Types</option>
                <option value="calls">Calls Only</option>
                <option value="topups">Topups Only</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.5fr] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <div>Description</div>
            <div>Status</div>
            <div>Event ID</div>
            <div className="text-right">Amount</div>
          </div>

          {/* Rows */}
          <div className="min-h-[320px] px-3">
            {fetchingTransactions ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((tx) => {
                const d = new Date(tx.processedAt);
                return (
                  <TransactionRow
                    key={tx._id}
                    eventId={tx.callId}
                    description={tx.type.split("-").join(" ").toUpperCase()}
                    amount={tx.amount.toString()}
                    date={d.toLocaleDateString()}
                    time={d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                <ReceiptText className="w-8 h-8 mb-2 text-gray-200" />
                <p className="text-sm">No transactions found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletUsageContent;
