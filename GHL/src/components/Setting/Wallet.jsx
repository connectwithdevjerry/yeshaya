// src/components/WalletUsageContent.jsx

import React from "react";
import {
  Settings,
  CreditCard,
  ChevronDown,
  Download,
  CheckCircle,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Zap,
  Info,
} from "lucide-react";
import Card from "../ui/Card";
import { transactionData } from "../../data/accountsData";
import PaymentCardWidget from "./Wallet/PaymentCardWidget";
import WalletBalanceCard from "./Wallet/WalletBalanceCard";
import AutopayToggle from "./Wallet/AutopayToggle";
import TransactionRow from "./Wallet/TransactionRow";


// --- Main Component ---

const WalletUsageContent = () => {
  // Mock Data

  return (
    <Card>
      {/* Top Section: Cards, Autopay, Actions */}
      <div className="flex flex-wrap lg:flex-nowrap gap-6 mb-8">
        {/* Card Widgets */}
        <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
          <PaymentCardWidget />
          {/* <WalletBalanceCard balance={9.0} /> */}
        </div>

        {/* Autopay & Actions */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AutopayToggle />

          {/* Actions */}
          <div className="lg:col-span-1 p-4">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">
              ACTIONS
            </h4>
            <div className="space-y-2 text-sm">
              <a
                href="#"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Settings className="w-4 h-4 mr-2" /> Edit Customer Information
              </a>
              <a
                href="#"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Update Card Info
              </a>
              <a
                href="#"
                className="flex items-center text-indigo-600 hover:text-indigo-800"
              >
                <Download className="w-4 h-4 mr-2" /> Go To Portal
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Header */}
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pt-4 border-t">
        Transaction History
      </h3>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          {/* Date Range Picker (Mockup) */}
          <div className="flex items-center space-x-1 p-2 border border-gray-300 rounded-md text-sm text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>10/05/2025</span>
            <span className="text-gray-400">-</span>
            <span>10/13/2025</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by call ID, checkout session, etc."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full sm:w-64"
            />
          </div>
          {/* Filter Dropdown */}
          <div className="relative">
            <select className="pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500">
              <option>No filter</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transaction Table Header */}
      <div className="grid grid-cols-[1fr_0.8fr_0.8fr_0.5fr] gap-4 py-3 border-b text-sm font-medium text-gray-500 uppercase tracking-wider">
        <div>Description</div>
        <div>Status</div>
        <div>Event ID</div>
        <div className="text-right">Amount</div>
      </div>

      {/* Transaction Rows */}
      <div>
        {transactionData.map((tx, index) => (
          <TransactionRow key={index} {...tx} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4 mt-4 border-t">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span>10</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
          <span>Showing 1-10</span>
          <span className="font-medium text-gray-500">12 Results</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="text-gray-500">Page 1 of 2</div>
          <button
            className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            disabled
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default WalletUsageContent;
