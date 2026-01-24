import React, { useEffect } from "react";
import { Zap, Info, ChevronDown, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getChargingDetails, updateChargingDetails } from "../../../../store/slices/integrationSlice";
import { fetchWalletBalance } from "../../../../store/slices/assistantsSlice";;


const AutopayToggle = () => {
  const dispatch = useDispatch();
  
  // Pulling state from multiple slices to ensure full synchronization
  const { chargingDetails, chargingLoading, updateLoading } = useSelector(
    (state) => state.integrations
  );

  useEffect(() => {
    dispatch(getChargingDetails());
  }, [dispatch]);

  const settings = chargingDetails?.autoCharging || {
    status: false,
    least: 5,
    refillAmount: 10,
  };

  const onUpdateField = async (field, value) => {
    // 1. Prepare the payload
    const payload = {
      status: field === "status" ? value : settings.status,
      least: field === "least" ? value : settings.least,
      refillAmount: field === "refillAmount" ? value : settings.refillAmount,
    };

    try {
      // 2. Execute the update and wait for it to finish
      await dispatch(updateChargingDetails(payload)).unwrap();
      
      await Promise.all([
        // dispatch(getUserDetails()),
        dispatch(getChargingDetails()),
        dispatch(fetchWalletBalance())
      ]);

      console.log("✅ Settings updated and data re-synchronized");
    } catch (error) {
      console.error("❌ Failed to update or sync data:", error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm col-span-1 md:col-span-2 relative">
      {/* Visual Feedback during update/refresh sync */}
      {updateLoading && (
        <div className="absolute inset-0 bg-white/40 z-20 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
          <div className="bg-white p-3 rounded-full shadow-xl flex items-center gap-2 border border-gray-100">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Syncing...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center">
          <Zap className={`w-5 h-5 mr-2 ${settings.status ? "text-indigo-500" : "text-gray-400"}`} />
          <span className="text-lg font-semibold text-gray-800 uppercase">
            Enable Autopay
          </span>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.status}
            onChange={(e) => onUpdateField("status", e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      <div className={`space-y-4 pt-4 transition-opacity duration-300 ${!settings.status ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        {/* Least Threshold Select */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            When my balance gets below
            <span className="ml-1 text-gray-400 cursor-help" title="Minimum balance threshold">
              <Info className="w-4 h-4" />
            </span>
          </label>
          <div className="relative">
            <select 
              value={settings.least}
              onChange={(e) => onUpdateField("least", Number(e.target.value))}
              className="appearance-none pl-3 pr-9 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer"
            >
              {[5, 10, 25, 50, 100].map(val => (
                <option key={val} value={val}>${val}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Refill Amount Select */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 flex items-center">
            Re-fill my wallet with
            <span className="ml-1 text-gray-400 cursor-help" title="Amount to refill">
              <Info className="w-4 h-4" />
            </span>
          </label>
          <div className="relative">
            <select 
              value={settings.refillAmount}
              onChange={(e) => onUpdateField("refillAmount", Number(e.target.value))}
              className="appearance-none pl-3 pr-9 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white cursor-pointer"
            >
              {[10, 25, 50, 100, 200].map(val => (
                <option key={val} value={val}>${val}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutopayToggle;