// src/components/components-ui/Rebilling/PricingBySubAccountTable.jsx
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Loader2, Building2, Bot, Phone, DollarSign, RefreshCw, TrendingUp, FileText } from "lucide-react";
import { fetchSubAccountSpend } from "../../../store/slices/assistantsSlice";
import { fetchRebillingBreakdown, generateRebillingInvoice } from "../../../store/slices/integrationSlice";
import { downloadInvoice } from "../../../store/slices/invoiceSlice";
import toast from "react-hot-toast";

// ─── Colour palette cycles through sub-accounts ──────────────────────────────
const GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-blue-500 to-cyan-600",
  "from-violet-500 to-purple-600",
];

const fmt = (n) =>
  n === 0
    ? "$0.00"
    : `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ i }) => (
  <tr className="border-b border-gray-50">
    {[55, 30, 30, 30, 30, 30, 40].map((w, j) => (
      <td key={j} className="px-5 py-4">
        <div
          className="h-3.5 bg-gray-100 rounded-full animate-pulse"
          style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
        />
      </td>
    ))}
  </tr>
);

const PricingBySubAccountTable = () => {
  const dispatch = useDispatch();
  const [invoicingId, setInvoicingId] = React.useState(null);

  useEffect(() => { dispatch(fetchRebillingBreakdown()); }, [dispatch]);

  const handleInvoice = async (accountId) => {
    setInvoicingId(accountId);
    try {
      const inv = await dispatch(generateRebillingInvoice(accountId)).unwrap();
      toast.success(`Invoice ${inv.invoiceNumber} created`);
      // Stream the PDF from our server (avoids Cloudinary delivery issues)
      const url = await dispatch(downloadInvoice(inv._id)).unwrap();
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err || "Failed to generate invoice");
    } finally {
      setInvoicingId(null);
    }
  };

  // Live spend data per accountId from Redux
  const { subAccountSpend, fetchingSubAccountSpend } = useSelector((s) => s.assistants);

  // Sub-account names + rebilling breakdown from Redux
  const { subAccounts, rebillingBreakdown } = useSelector((s) => s.integrations || {});

  // Build lookup maps
  const nameMap = React.useMemo(() => {
    const map = {};
    (subAccounts || []).forEach((acc) => {
      map[acc.id] = acc.customName || acc.name || acc.id;
    });
    return map;
  }, [subAccounts]);

  const rebillMap = React.useMemo(() => {
    const map = {};
    (rebillingBreakdown || []).forEach((r) => { map[r.accountId] = r.totalBillable; });
    return map;
  }, [rebillingBreakdown]);

  // Merge spend + rebilled, compute margin, sort by spend desc
  const rows = React.useMemo(() => {
    return [...(subAccountSpend || [])]
      .map((row) => {
        const rebilled = rebillMap[row.accountId] ?? 0;
        const margin = rebilled - (row.totalSpend || 0);
        return {
          ...row,
          displayName: nameMap[row.accountId] || `Account ${row.accountId?.slice(0, 6)}…`,
          rebilled,
          margin,
        };
      })
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [subAccountSpend, nameMap, rebillMap]);

  const totalSpend    = rows.reduce((s, r) => s + r.totalSpend, 0);
  const totalRebilled = rows.reduce((s, r) => s + r.rebilled, 0);

  const handleRefresh = () => {
    dispatch(fetchSubAccountSpend());
    dispatch(fetchRebillingBreakdown());
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

      {/* ── Header ── */}
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Rebilling by sub-account</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Cost vs. what you rebill clients (usage × your rebilling prices)
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={fetchingSubAccountSpend}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetchingSubAccountSpend ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Table ── */}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80">
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Sub-account
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Assistants
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Total Calls
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Cost
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Rebilled
            </th>
            <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
              Margin
            </th>
            <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide" />
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {/* Loading state */}
          {fetchingSubAccountSpend && rows.length === 0 && (
            [0, 1, 2].map((i) => <SkeletonRow key={i} i={i} />)
          )}

          {/* Empty state */}
          {!fetchingSubAccountSpend && rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No sub-account data yet</p>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Import sub-accounts and make calls to see per-account spend here.
                  </p>
                </div>
              </td>
            </tr>
          )}

          {/* Data rows */}
          {rows.map((row, idx) => {
            const gradient  = GRADIENTS[idx % GRADIENTS.length];
            const initial   = row.displayName.charAt(0).toUpperCase();

            return (
              <motion.tr
                key={row.accountId}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                className="hover:bg-indigo-50/20 transition-colors group"
              >
                {/* Sub-account name */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                        {row.displayName}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                        {row.accountId?.slice(0, 8)}…
                      </p>
                    </div>
                  </div>
                </td>

                {/* Assistant count */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {row.assistantCount ?? 0}
                    </span>
                  </div>
                </td>

                {/* Total calls */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-sm font-semibold text-gray-700 tabular-nums">
                      {(row.totalCalls ?? 0).toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Cost (raw) */}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span className={`text-sm font-semibold tabular-nums ${row.totalSpend > 0 ? "text-gray-700" : "text-gray-400"}`}>
                      {fmt(row.totalSpend)}
                    </span>
                  </div>
                </td>

                {/* Rebilled (what you charge the client) */}
                <td className="px-5 py-3.5">
                  <span className={`text-sm font-bold tabular-nums ${row.rebilled > 0 ? "text-indigo-600" : "text-gray-400"}`}>
                    {fmt(row.rebilled)}
                  </span>
                </td>

                {/* Margin (profit) */}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${
                    row.margin > 0 ? "text-emerald-600" : row.margin < 0 ? "text-rose-500" : "text-gray-400"
                  }`}>
                    {row.margin > 0 && <TrendingUp className="w-3.5 h-3.5" />}
                    {row.margin >= 0 ? fmt(row.margin) : `-${fmt(Math.abs(row.margin))}`}
                  </span>
                </td>

                {/* Invoice action */}
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleInvoice(row.accountId)}
                    disabled={invoicingId === row.accountId || row.rebilled <= 0}
                    title={row.rebilled <= 0 ? "No billable usage" : "Generate rebilling invoice"}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {invoicingId === row.accountId
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <FileText className="w-3.5 h-3.5" />}
                    Invoice
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Footer totals ── */}
      {rows.length > 0 && (
        <div className="px-5 py-3.5 border-t border-gray-50 bg-gray-50/40 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            {rows.length} sub-account{rows.length !== 1 ? "s" : ""} · {rows.reduce((s, r) => s + r.totalCalls, 0).toLocaleString()} total calls
          </p>
          <div className="flex items-center gap-5 text-sm tabular-nums">
            <span className="text-gray-500">Cost <span className="font-bold text-gray-700">{fmt(totalSpend)}</span></span>
            <span className="text-gray-500">Rebilled <span className="font-bold text-indigo-600">{fmt(totalRebilled)}</span></span>
            <span className="text-gray-500">Margin <span className="font-bold text-emerald-600">{fmt(totalRebilled - totalSpend)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingBySubAccountTable;
