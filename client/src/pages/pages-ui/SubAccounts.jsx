// src/pages/SubAccounts.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Folder,
  Trash2,
  Users,
  Link,
  Wallet,
  Link2,
  UploadCloud,
  Zap,
  ArrowRightLeft,
  Info,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchImportedSubAccounts } from "../../store/slices/integrationSlice";
import FolderModal from "../../components/components-ui/Modals/FolderModal";
import { AccountDetailSidebar } from "../../components/components-ui/Modals/AccountDetailSidebar";
import AccountActionsMenu from "../../components/components-ui/Accounts/AccountActionsMenu";
import { copyTextToClipboard } from "../../helper";
import ImportSubaccountsModal from "../../components/components-ui/Accounts/ImportSubaccountsModal";

function SubAccounts() {
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMenuAccountId, setOpenMenuAccountId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const menuAnchorRef = useRef(null);
  const dropdownRef = useRef(null);

  const dispatch = useDispatch();
  const { subAccounts, loading, error, agencyId } = useSelector(
    (state) => state.integrations || {}
  );

  // fetch imported subaccounts only for this page
  useEffect(() => {
    dispatch(fetchImportedSubAccounts());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = ["All", "Active", "Favorites", "Re-billed", "Archived"];
  const filtered =
    activeTab === "All" ? subAccounts : subAccounts?.filter(() => false);

  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    setIsSidebarOpen(true);
    setOpenMenuAccountId(null);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSelectedAccount(null);
  };

  const handleOpenActionMenu = (e, account) => {
    e.stopPropagation();

    if (openMenuAccountId === account.id) {
      setOpenMenuAccountId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 350;
    const viewportHeight = window.innerHeight;
    let topPosition = rect.bottom + 5;
    if (topPosition + menuHeight > viewportHeight && rect.top > menuHeight) {
      topPosition = rect.top - menuHeight - 5;
    }
    setMenuPosition({
      top: topPosition,
      left: rect.right - 240,
    });

    setSelectedAccount(account);
    setOpenMenuAccountId(account.id);
  };

  const handleCloseActionMenu = () => {
    setOpenMenuAccountId(null);
  };

  const DropdownItem = ({ icon: Icon, text, handleClick }) => (
    <li>
      <button
        onClick={handleClick}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-gray-600" />
          <span>{text}</span>
        </div>
        <Info size={16} className="text-gray-400" />
      </button>
    </li>
  );

  const linkToCopy = (agencyid) =>
    `https://www.yashayah.cloud/app?agencyid=${agencyid}&subaccount={{location.id}}&allow=yes&myname={{user.name}}&myemail={{user.email}}&route=%2Fassistants`;

  return (
    <div className="text-gray-800 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-blue-600 text-sm font-medium cursor-pointer">
          Account Snapshot
        </h1>
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search for an account..."
              className="border border-gray-300 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-60"
            />
          </div>

          {/* New Folder */}
          {/* <button
            onClick={() => setIsModalOpen(true)}
            className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center gap-1"
          >
            <Folder size={14} /> New Folder
          </button> */}

          {/* New Sub-account Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-black text-white px-4 py-2 rounded-md text-sm flex items-center gap-1 hover:bg-gray-800"
            >
              <Plus size={14} /> New Sub-account
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden py-1">
                <ul>
                  <DropdownItem
                    icon={Link2}
                    handleClick={() => {
                      const url = linkToCopy(agencyId);
                      copyTextToClipboard(url);
                    }}
                    text="Custom menu link"
                  />
                  <DropdownItem
                    icon={UploadCloud}
                    handleClick={() => {
                      setIsImportModalOpen(true); // opens modal for fetching new subaccounts
                      setIsDropdownOpen(false);
                    }}
                    text="Import installed"
                  />
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
            {tab} {tab === "All" ? `(${filtered?.length || 0})` : "(0)"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-center p-6 text-gray-500">
            Loading subaccounts...
          </p>
        ) : error ? (
          <p className="text-center p-6 text-red-500">
            Error: {error.message || JSON.stringify(error)}
          </p>
        ) : !filtered?.length ? (
          <p className="text-center p-6 text-gray-400">
            No subaccounts available.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-3 text-left font-medium w-1/4">NAME</th>
                <th className="p-3 text-left font-medium w-1/5">LOCATION ID</th>
                <th className="p-3 text-left font-medium w-1/6">WALLET</th>
                <th className="p-3 text-left font-medium w-1/5">
                  CONNECTION STATUS
                </th>
                <th className="p-3 text-left font-medium w-1/6"></th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-b hover:bg-gray-50 transition text-sm text-gray-700"
                  onClick={() => handleAccountClick(acc)}
                >
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-blue-600 font-medium hover:underline">
                        {acc.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 align-middle text-gray-600 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {acc.id.slice(0, 4)}...{acc.id.slice(-4)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 align-middle text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} />
                      <span className="text-sm">$0.00</span>
                    </div>
                  </td>
                  <td className="p-3 align-middle">
                    <div className="flex items-center gap-2 text-green-600 whitespace-nowrap">
                      <Link size={18} />
                      <span className="text-sm">Connected</span>
                    </div>
                  </td>
                  <td className="p-3 align-middle w-40">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded-full hover:bg-gray-100"
                        aria-label="users"
                        title="Users"
                      >
                        <Users size={16} className="text-gray-500" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionMenu(e, acc);
                        }}
                        ref={openMenuAccountId === acc.id ? menuAnchorRef : null}
                        className="p-2 border rounded-md hover:bg-gray-100"
                        aria-label="more"
                        title="More"
                      >
                        <MoreHorizontal size={16} className="text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 border rounded-md bg-red-50 hover:bg-red-200"
                        aria-label="delete"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <FolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {/* Import modal fetches its own subaccounts internally */}
      <ImportSubaccountsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
      <AccountDetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        account={selectedAccount}
      />
      {openMenuAccountId && selectedAccount && (
        <AccountActionsMenu
          isOpen={true}
          onClose={handleCloseActionMenu}
          account={selectedAccount}
          position={menuPosition}
          anchorRef={menuAnchorRef}
        />
      )}
    </div>
  );
}

export default SubAccounts;
