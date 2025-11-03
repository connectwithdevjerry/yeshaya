// src/components/TopUpBalanceModal.jsx (Create this new file)
import React, { useState } from "react";
import { X } from "lucide-react";

const TopUpBalanceModal = ({ isOpen, onClose, currentBalance }) => {
  const initialBalance = currentBalance || 8.83;
  const minRefillAmount = 1;
  const maxRefillAmount = 500;

  const [refillAmount, setRefillAmount] = useState(191.0);

  if (!isOpen) return null;

  const totalBalance = initialBalance + refillAmount;

  const handleRefillChange = (e) => {
    const value = parseFloat(e.target.value);
    setRefillAmount(value);
  };

  const handleAddBalance = () => {
    console.log(
      `Adding $${refillAmount.toFixed(
        2
      )} to balance. New Total: $${totalBalance.toFixed(2)}`
    );

    onClose();
  };

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

  return (
    // Modal Overlay
    <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full rounded-lg shadow-2xl max-w-md mx-4 p-6 relative">
        <div className="flex justify-between items-start border-b pb-3 mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Top up balance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
            <span>Current balance</span>
            <span>{formatCurrency(initialBalance)}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <p className="text-3xl font-bold text-gray-800">
              {formatCurrency(refillAmount)}
            </p>
            <p className="text-gray-500">
              {formatCurrency(maxRefillAmount)} Max
            </p>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min={minRefillAmount}
            max={maxRefillAmount}
            step="0.01"
            value={refillAmount}
            onChange={handleRefillChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 text-gray-800">
          <div className="flex justify-between py-1">
            <span>Balance</span>
            <span className="font-semibold">
              {formatCurrency(initialBalance)}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-gray-200 mb-2">
            <span>Re-fill</span>
            <span className="font-semibold text-green-600">
              + {formatCurrency(refillAmount)}
            </span>
          </div>

          <div className="flex justify-between pt-2 text-lg font-bold">
            <span>Total Balance</span>
            <span>{formatCurrency(totalBalance)}</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleAddBalance}
            className="w-full px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-purple-400 to-indigo-600 rounded-md hover:from-purple-500 hover:to-indigo-700 transition shadow-lg"
          >
            Add Balance
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopUpBalanceModal;
