// src/pages/SubAccounts.jsx
import React, { useState, useEffect, useRef } from "react"; // --- MODIFICATION ---
import {
  Search,
  Plus,
  Folder,
  Trash2,
  Users,
  Link,
  ChevronLeft,
  ChevronRight,
  Link2,
  UploadCloud, 
  Zap,         
  ArrowRightLeft, 
  Info,

} from "lucide-react";

import FolderModal from "../../components/components-ui/Modals/FolderModal";
import { AccountDetailSidebar } from "../../components/components-ui/Modals/AccountDetailSidebar";

function SubAccounts() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const dropdownRef = useRef(null); 

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false); 
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const tabs = ["All", "Active", "Favorites", "Re-billed", "Archived"];

  const accounts = [
    {
      id: 1,
      name: "YashaYah AI",
      locationId: "r4bu...29aF",
      wallet: "$0.00",
      status: "Connected",
    },
    {
      id: 2,
      name: "Salvation solutions",
      locationId: "p0JB...67rQ",
      wallet: "$0.00",
      status: "Connected",
    },
  ];

  const filtered =
    activeTab === "All" ? accounts : accounts.filter(() => false);

    const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setIsSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedAccount(null); 
  }

  const DropdownItem = ({ icon: Icon, text }) => (
    <li>
      <button className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-gray-600" />
          <span>{text}</span>
        </div>
        <Info size={16} className="text-gray-400" />
      </button>
    </li>
  );
 
  return (
    <div className="text-gray-800 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-blue-600 text-sm font-medium cursor-pointer">
            Account Snapshot
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search for an account..."
              className="border border-gray-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1"
          >
            <Folder size={14} /> New Folder
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
              className="bg-black text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-gray-800"
            >
              <Plus size={14} /> New Sub-account
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden py-1">
                <ul>
                  <DropdownItem icon={Link2} text="Custom menu link" />
                  <DropdownItem icon={UploadCloud} text="Import installed" />
                  <DropdownItem icon={Zap} text="Direct connection" />
                  <DropdownItem icon={ArrowRightLeft} text="Transfer account" />
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b text-sm mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                : "text-gray-500"
            }`}
          >
            {tab} {tab === "All" ? `(${accounts.length})` : "(0)"}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-2">
        Home / <span className="capitalize">{activeTab}</span> /{" "}
        <span className="text-blue-600 cursor-pointer">Select all</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="p-3 text-left font-medium">NAME</th>
              <th className="p-3 text-left font-medium">LOCATION ID</th>
              <th className="p-3 text-left font-medium">WALLET</th>
              <th className="p-3 text-left font-medium">CONNECTION STATUS</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xl">🚫</span> No locations to display
                  </span>
                </td>
              </tr>
            ) : (
              filtered.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                  onClick={() => handleAccountClick(acc)}
                >
                  <td className="p-3 align-middle">
                    <div className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-indigo-600 cursor-pointer hover:underline">
                        {acc.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 align-middle">
                    {acc.locationId}
                  </td>
                  <td className="p-3 align-middle">{acc.wallet}</td>
                  <td className="p-3 text-green-600 align-middle">
                    <div className="flex items-center gap-2">
                      <Link size={14} />
                      <span>{acc.status}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right align-middle">
                    <div className="flex gap-2 justify-end items-center">
                      <Users
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        size={16}
                      />
                      <Trash2
                        className="text-red-400 hover:text-red-600 cursor-pointer"
                        size={16}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 text-sm text-gray-500 border-t">
          <div className="flex items-center gap-2">
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>Showing 1 - {filtered.length ? filtered.length : 10}</span>
          </div>
          <div className="flex items-center gap-1">
            <p className="">page 1 of 1</p>
            <button className="p-1 border rounded disabled:text-gray-300" disabled>
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 border rounded disabled:text-gray-300" disabled>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Render the modal component */}
      <FolderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <AccountDetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        account={selectedAccount}
      />
    </div>
  );
}

export default SubAccounts;