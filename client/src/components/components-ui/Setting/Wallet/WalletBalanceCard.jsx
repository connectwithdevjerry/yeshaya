import React from "react";

const WalletBalanceCard = ({balance}) => {
  return (
    <div className="flex flex-col justify-between p-5 w-full md:w-80 h-48 rounded-lg shadow-lg bg-white border border-gray-200">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-gray-500">Current Balance</p>
        <p className="text-4xl font-bold text-gray-800">
          ${balance.toFixed(2)}
        </p>
      </div>
      <button className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md hover:bg-indigo-600 transition-colors self-start">
        Add Balance
      </button>
    </div>
  );
};

export default WalletBalanceCard;
