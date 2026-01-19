// src/components/WalletUsageContent.jsx
import React, { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useSelector } from "react-redux"; 
import TopUpBalanceModal from "./AddBalance";

const PaymentCardWidget = () => {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const { walletBalance, fetchingBalance } = useSelector((state) => state.assistants);
  
  const currentBalance = walletBalance !== null ? Number(walletBalance) : 0.00;

  const openTopUpModal = () => setIsTopUpModalOpen(true);
  const closeTopUpModal = () => setIsTopUpModalOpen(false);

  return (
    <div
      className="p-5 w-full md:w-80 h-48 rounded-lg shadow-lg flex flex-col justify-between"
      style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
    >
      <div className="flex justify-between items-start">
        <span className="text-white text-sm font-semibold tracking-wider">VISA</span>
        <CreditCard className="w-6 h-6 text-white opacity-80" />
      </div>

      <div className="text-white">
        <div className="flex justify-between mb-2">
          <p className="text-[10px] uppercase opacity-70 tracking-tighter">Card Holder</p>
          <p className="text-[10px] uppercase opacity-70 tracking-tighter">Card Number</p>
        </div>
        <div className="flex justify-between items-baseline mb-4">
          <p className="text-sm font-medium truncate max-w-[120px]">Current User</p>
          <p className="text-sm font-semibold tracking-widest">**** 1182</p>
        </div>
      </div>

      <div>
        <hr className="my-2 border-t border-white opacity-30" />
        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <p className="text-[10px] uppercase font-medium text-white opacity-70">Available Balance</p>
            <div className="flex items-center gap-2">
               <p className="text-2xl font-bold text-white">
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
            className="px-4 py-2 bg-white text-indigo-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-all active:scale-95 shadow-md"
          >
            Add Balance
          </button>
        </div>
      </div>

      {/* Passing state and logic to the Modal */}
      <TopUpBalanceModal
        isOpen={isTopUpModalOpen}
        onClose={closeTopUpModal}
        currentBalance={currentBalance}
      />
    </div>
  );
};

export default PaymentCardWidget;