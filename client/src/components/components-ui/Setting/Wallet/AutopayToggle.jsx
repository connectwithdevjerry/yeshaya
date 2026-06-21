// src/components/components-ui/Setting/Wallet/AutopayToggle.jsx
import React, { useEffect } from "react";
import { Zap, Info, ChevronDown, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getChargingDetails, updateChargingDetails } from "../../../../store/slices/integrationSlice";
import { fetchWalletBalance } from "../../../../store/slices/assistantsSlice";

/* ── Indigo gradient toggle ── */
const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/30
      ${value ? "bg-gradient-to-r from-indigo-500 to-violet-600" : "bg-gray-200"}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
      ${value ? "translate-x-4" : "translate-x-0.5"}`}
    />
  </button>
);

const selectCls =
  "appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer outline-none transition-all";

const AutopayToggle = () => {
  const dispatch = useDispatch();
  const { chargingDetails, chargingLoading, updateLoading } = useSelector(
    (state) => state.integrations
  );

  useEffect(() => { dispatch(getChargingDetails()); }, [dispatch]);

  const settings = chargingDetails?.autoCharging || { status: false, least: 5, refillAmount: 10 };

  const onUpdateField = async (field, value) => {
    const payload = {
      status:       field === "status"       ? value : settings.status,
      least:        field === "least"        ? value : settings.least,
      refillAmount: field === "refillAmount" ? value : settings.refillAmount,
    };
    try {
      await dispatch(updateChargingDetails(payload)).unwrap();
      await Promise.all([dispatch(getChargingDetails()), dispatch(fetchWalletBalance())]);
    } catch (err) {
      console.error("Failed to update autopay:", err);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 p-5 col-span-1 md:col-span-2">
      {/* Syncing overlay */}
      {updateLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-lg border border-gray-100">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-xs font-semibold text-gray-600">Syncing…</span>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${settings.status ? "text-indigo-500" : "text-gray-400"}`} />
          <span className="text-sm font-semibold text-gray-800">Enable Autopay</span>
        </div>
        <Toggle value={settings.status} onChange={(v) => onUpdateField("status", v)} />
      </div>

      {/* Settings rows */}
      <div className={`space-y-3 transition-opacity duration-300 ${!settings.status ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 flex items-center gap-1.5">
            When my balance falls below
            <span title="Minimum balance threshold" className="text-gray-400">
              <Info className="w-3.5 h-3.5" />
            </span>
          </label>
          <div className="relative">
            <select
              value={settings.least}
              onChange={(e) => onUpdateField("least", Number(e.target.value))}
              className={selectCls}
            >
              {[5, 10, 25, 50, 100].map((v) => <option key={v} value={v}>${v}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 flex items-center gap-1.5">
            Refill my wallet with
            <span title="Amount to refill" className="text-gray-400">
              <Info className="w-3.5 h-3.5" />
            </span>
          </label>
          <div className="relative">
            <select
              value={settings.refillAmount}
              onChange={(e) => onUpdateField("refillAmount", Number(e.target.value))}
              className={selectCls}
            >
              {[10, 25, 50, 100, 200].map((v) => <option key={v} value={v}>${v}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutopayToggle;
