// src/components/components-ui/Setting/Wallet.jsx
import React, { useEffect, useState } from "react";
import {
  Settings, CreditCard, Download,
  Search, ChevronDown, ChevronLeft, ChevronRight,
  Loader2, ReceiptText, ExternalLink,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransactionHistory } from "../../../store/slices/assistantsSlice";
import PaymentCardWidget from "./Wallet/PaymentCardWidget";
import AutopayToggle     from "./Wallet/AutopayToggle";
import TransactionRow    from "./Wallet/TransactionRow";
import apiClient from "../../../store/api/config";
import toast from "react-hot-toast";

const selectCls =
  "appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm bg-white cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";

// ─── Stripe portal opener ────────────────────────────────────────────────────
const useStripePortal = () => {
  const [loadingFlow, setLoadingFlow] = useState(null); // track which button is loading

  const openPortal = async (flow = null) => {
    setLoadingFlow(flow || "general");
    try {
      // "general_customer" is a UI-only key — maps to general portal (no flow param)
      const apiFlow = (flow && flow !== "general_customer") ? flow : null;
      const params  = apiFlow ? `?flow=${apiFlow}` : "";
      console.log("🔄 Opening Stripe portal — UI flow:", flow, "| API flow:", apiFlow || "general");
      const res = await apiClient.get(`/integrations/stripe-portal-link${params}`);
      console.log("✅ Stripe portal response:", res.data);

      if (res.data?.status === false) {
        toast.error(res.data.message || "Failed to open portal");
        return;
      }

      if (res.data?.url) {
        window.open(res.data.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("No portal URL returned");
      }
    } catch (err) {
      console.error("❌ Stripe portal error:", err.response?.data || err.message);
      const msg = err.response?.data?.message || "Failed to open Stripe portal";
      toast.error(msg);
    } finally {
      setLoadingFlow(null);
    }
  };

  return { openPortal, loadingFlow };
};

// ─── Quick Action Button ─────────────────────────────────────────────────────
const QuickActionButton = ({ icon: Icon, label, onClick, loading, gradient, iconBg }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
  >
    {/* Icon */}
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
        : <Icon className={`w-3.5 h-3.5 ${gradient}`} />
      }
    </div>

    {/* Label — single line, no wrap */}
    <span className="flex-1 text-sm font-medium text-gray-700 text-left">
      {loading ? "Opening…" : label}
    </span>

    {/* Arrow */}
    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const WalletUsageContent = () => {
  const dispatch = useDispatch();
  const { openPortal, loadingFlow } = useStripePortal();

  const [searchTerm,  setSearchTerm]  = useState("");
  const [filterType,  setFilterType]  = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
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

      {/* Wallet + Autopay + Quick Actions row */}
      <div className="flex flex-wrap lg:flex-nowrap gap-4">
        <div className="flex-shrink-0">
          <PaymentCardWidget />
        </div>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <AutopayToggle />
          </div>

          {/* Quick Actions — live */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                Quick Actions
              </p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="space-y-2">
              <QuickActionButton
                icon={Settings}
                label="Edit Customer Info"
                loading={loadingFlow === "general_customer"}
                onClick={() => openPortal("general_customer")}
                iconBg="bg-blue-50"
                gradient="text-blue-500"
              />

              <QuickActionButton
                icon={CreditCard}
                label="Update Card Info"
                loading={loadingFlow === "payment_method_update"}
                onClick={() => openPortal("payment_method_update")}
                iconBg="bg-violet-50"
                gradient="text-violet-500"
              />

              <QuickActionButton
                icon={Download}
                label="Go To Portal"
                loading={loadingFlow === "general"}
                onClick={() => openPortal(null)}
                iconBg="bg-emerald-50"
                gradient="text-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-50">
              <div className="w-3.5 h-3.5 rounded-full bg-[#635BFF] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold" style={{ fontSize: "7px" }}>S</span>
              </div>
              <p className="text-[10px] text-gray-400">Secured by Stripe · Opens in new tab</p>
            </div>
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
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.5fr] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <div>Description</div>
            <div>Status</div>
            <div>Event ID</div>
            <div className="text-right">Amount</div>
          </div>

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
            <span className="text-xs text-gray-400">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
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
