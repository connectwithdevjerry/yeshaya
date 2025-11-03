// src/components/WalletUsageContent.jsx
import Reac, { useState } from "react";
import { CreditCard } from "lucide-react";
import TopUpBalanceModal from "./AddBalance";
const PaymentCardWidget = ({ balance = 9.0 }) => {
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const openTopUpModal = () => setIsTopUpModalOpen(true);
  const closeTopUpModal = () => setIsTopUpModalOpen(false);
  return (
    <div
      className="p-5 w-full md:w-80 h-48 rounded-lg shadow-lg flex flex-col justify-between"
      style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
    >
      <div className="flex justify-between items-start">
        <span className="text-white text-sm font-semibold">VISA</span>
        <CreditCard className="w-6 h-6 text-white opacity-80" />
      </div>

      <div className="text-white">
        <div className="flex justify-between mb-2">
          <p className="text-sm opacity-90">Name</p>
          <p className="text-sm opacity-90">Number</p>
        </div>
        <div className="flex justify-between items-baseline mb-4">
          <p className="text-lg font-medium">Current User</p>
          <p className="text-xl font-semibold">**** **** **** 1182</p>
        </div>
      </div>

      <div>
        <hr className="my-2 border-t border-white opacity-30" />
        <div className="flex justify-between items-center pt-2">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-white opacity-90">Balance</p>
            <p className="text-2xl font-bold text-white">
              ${balance.toFixed(2)}
            </p>
          </div>
          <button
            onClick={openTopUpModal}
            className="px-4 py-2 bg-white text-indigo-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Add Balance
          </button>
        </div>
      </div>

      <TopUpBalanceModal
        isOpen={isTopUpModalOpen}
        onClose={closeTopUpModal}
        currentBalance={balance}
      />
    </div>
  );
};

export default PaymentCardWidget;
