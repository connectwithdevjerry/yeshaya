import React, { useState, useEffect } from "react";
import { CreditCard, Loader2, Wifi, WifiOff } from "lucide-react";
import { useSelector, useDispatch } from "react-redux"; 
import { getChargingDetails } from "../../../../store/slices/integrationSlice";
import TopUpBalanceModal from "./AddBalance";

const PaymentCardWidget = () => {
  const dispatch = useDispatch();
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // 1. Pull data from both slices
  const { walletBalance, fetchingBalance } = useSelector((state) => state.assistants);
  const { chargingDetails, chargingLoading } = useSelector((state) => state.integrations);
  const { user } = useSelector((state) => state.auth);

  // 2. Fetch details on mount
  useEffect(() => {
    dispatch(getChargingDetails());
  }, [dispatch]);

  const currentBalance = walletBalance !== null ? Number(walletBalance) : 0.00;
  
  // 3. Destructure Card and AutoCharging details
  const cardInfo = chargingDetails?.card || {};
  const autoCharge = chargingDetails?.autoCharging || {};

  const openTopUpModal = () => setIsTopUpModalOpen(true);
  const closeTopUpModal = () => setIsTopUpModalOpen(false);

  return (
    <div
      className="p-5 w-full md:w-80 h-52 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden transition-all hover:shadow-2xl"
      style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)" }}
    >
      {/* Decorative background circle */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full" />

      <div className="flex justify-between items-start relative z-10">
        <span className="text-white text-sm font-bold tracking-widest uppercase">
          {cardInfo.brand || "CARD"}
        </span>
        <div className="flex flex-col items-end">
          <CreditCard className="w-6 h-6 text-white opacity-90" />
          {/* Auto-recharge Status Indicator */}
          <div className="flex items-center mt-1">
            {autoCharge.status ? (
              <span className="text-[9px] text-green-300 font-bold flex items-center gap-1">
                <Wifi className="w-2 h-2" /> AUTO-REFILL
              </span>
            ) : (
              <span className="text-[9px] text-white/50 font-bold flex items-center gap-1">
                <WifiOff className="w-2 h-2" /> MANUAL
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-white relative z-10">
        <div className="flex justify-between mb-1">
          <p className="text-[9px] uppercase opacity-60 tracking-wider">Card Holder</p>
          <p className="text-[9px] uppercase opacity-60 tracking-wider">Card Number</p>
        </div>
        <div className="flex justify-between items-baseline">
          <p className="text-xs font-semibold truncate max-w-[140px]">
            Current user
          </p>
          <p className="text-sm font-mono tracking-widest">
            {chargingLoading ? "...." : `**** ${cardInfo.last4 || "0000"}`}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <hr className="my-2 border-t border-white opacity-20" />
        <div className="flex justify-between items-center pt-1">
          <div className="flex flex-col">
            <p className="text-[9px] uppercase font-bold text-white opacity-70">Balance</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-white tracking-tight">
                {fetchingBalance && walletBalance === null ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `$${currentBalance.toFixed(2)}`
                )}
              </p>
            </div>
          </div>
          <button
            onClick={openTopUpModal}
            className="px-4 py-2 bg-white text-indigo-700 text-xs font-black rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-lg"
          >
            ADD FUNDS
          </button>
        </div>
      </div>

      <TopUpBalanceModal
        isOpen={isTopUpModalOpen}
        onClose={closeTopUpModal}
        currentBalance={currentBalance}
      />
    </div>
  );
};

export default PaymentCardWidget;