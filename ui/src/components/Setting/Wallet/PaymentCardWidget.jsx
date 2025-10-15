// src/components/WalletUsageContent.jsx (or wherever your PaymentCardWidget is defined)
import React from 'react';
import { CreditCard } from 'lucide-react'; // Assuming lucide-react for icons

const PaymentCardWidget = ({ balance = 9.00 }) => ( // Added balance prop for flexibility
  <div
    className="p-5 w-full md:w-80 h-48 rounded-lg shadow-lg flex flex-col justify-between" // Added flex-col and justify-between
    style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
  >
    {/* Top Section: VISA and CreditCard Icon */}
    <div className="flex justify-between items-start">
      <span className="text-white text-sm font-semibold">VISA</span>
      <CreditCard className="w-6 h-6 text-white opacity-80" />
    </div>

    {/* Middle Section: Name and Number */}
    <div className="text-white">
      <div className="flex justify-between mb-2"> {/* Use flex to align Name and Number */}
        <p className="text-sm opacity-90">Name</p>
        <p className="text-sm opacity-90">Number</p>
      </div>
      <div className="flex justify-between items-baseline mb-4"> {/* Align Current User and card number */}
        <p className="text-lg font-medium">Current User</p>
        <p className="text-xl font-semibold">**** **** **** 1182</p>
      </div>
    </div>

    {/* Bottom Section: Balance and Add Balance button */}
    <div>
      <hr className="my-2 border-t border-white opacity-30" /> {/* Separator line */}
      <div className="flex justify-between items-center pt-2"> {/* Flex to align balance and button */}
        <div className="flex flex-col"> {/* Balance text stack */}
          <p className="text-sm font-medium text-white opacity-90">Balance</p>
          <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
        </div>
        <button className="px-4 py-2 bg-white text-indigo-700 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors">
          Add Balance
        </button>
      </div>
    </div>
  </div>
);

export default PaymentCardWidget;