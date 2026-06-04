// src/pages/SubAccounts.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Trash2, Users, Link, Wallet, Link2,
  UploadCloud, Zap, ArrowRightLeft, Info, MoreHorizontal,
  Building2, CheckCircle2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchImportedSubAccounts, deleteSubAccount, updateSubAccountMeta, fetchRebillingBreakdown } from "../../store/slices/integrationSlice";
import FolderModal from "../../components/components-ui/Modals/FolderModal";
import { AccountDetailSidebar } from "../../components/components-ui/Modals/AccountDetailSidebar";
import AccountActionsMenu from "../../components/components-ui/Accounts/AccountActionsMenu";
import { copyTextToClipboard } from "../../helper";
import toast from "react-hot-toast";
import ImportSubaccountsModal from "../../components/components-ui/Accounts/ImportSubaccountsModal";

/* ── Avatar with gradient initials ── */
const AVATAR_COLORS = [
  "from-indigo-400 to-violet-500",
  "from-blue-400 to-cyan-500",
  "from-emerald-400 to-teal-500",
  "from-orange-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
];
const avatarColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
};
const Avatar = ({ name }) => (
  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
    <span className="text-white text-xs font-bold">{(name || "?").charAt(0).toUpperCase()}</span>
  </div>
);

/* ── Skeleton row ── */
const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-gray-100 rounded-lg animate-pulse" style={{ width: i === 0 ? "60%" : i === 4 ? "80px" : "50%" }} />
      </td>
    ))}
  </tr>
);

/* ── Empty state ── */
const EmptyState = ({ onImport }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
      <Building2 className="w-8 h-8 text-indigo-400" />
    </div>
    <h3 className="text-base font-semibold text-gray-800 mb-1">No sub-accounts yet</h3>
    <p className="text-sm text-gray-400 max-w-xs mb-6">
      Import your GoHighLevel sub-accounts or create a new one to get started.
    </p>
    <button
      onClick={onImport}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
    >
      <UploadCloud className="w-4 h-4" /> Import sub-accounts
    </button>
  </div>
);

/* ── Dropdown item ── */
const DropdownItem = ({ icon: Icon, text, onClick, description }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group"
  >
    <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
      <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-600" />
    </div>
    <div>
      <p className="font-medium leading-tight">{text}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
  </button>
);

/* ── Delete Confirm Dialog ── */
const DeleteConfirmDialog = ({ account, onConfirm, onCancel, deleting }) => (
  <AnimatePresence>
    {account && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900">Delete Sub-account</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-800">{account.name || "this account"}</span>?
                This will disconnect it from your agency. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Deleting…
                </>
              ) : (
                <><Trash2 className="w-4 h-4" /> Delete</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Edit Account Modal ── */
const EditAccountModal = ({ account, onSave, onCancel, saving }) => {
  const [customName, setCustomName] = React.useState(account?.customName || account?.name || "");
  const [notes,      setNotes]      = React.useState(account?.notes || "");

  React.useEffect(() => {
    if (account) {
      setCustomName(account.customName || account.name || "");
      setNotes(account.notes || "");
    }
  }, [account]);

  if (!account) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Edit Sub-account</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">{account.id?.slice(0,8)}…{account.id?.slice(-4)}</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Display Name</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder={account.name || "Enter a custom name…"}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <p className="text-[11px] text-gray-400">Original GHL name: <span className="font-medium text-gray-600">{account.name}</span></p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add notes about this account…"
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({ customName, notes })}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md hover:brightness-110 transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Saving…
                </>
              ) : "Save Changes"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ══════════════════════════════════ */
function SubAccounts() {
  const [activeTab,          setActiveTab]          = useState("All");
  const [searchQuery,        setSearchQuery]        = useState("");
  const [isModalOpen,        setIsModalOpen]        = useState(false);
  const [isDropdownOpen,     setIsDropdownOpen]     = useState(false);
  const [isSidebarOpen,      setIsSidebarOpen]      = useState(false);
  const [selectedAccount,    setSelectedAccount]    = useState(null);
  const [openMenuAccountId,  setOpenMenuAccountId]  = useState(null);
  const [isImportModalOpen,  setIsImportModalOpen]  = useState(false);
  const [menuPosition,       setMenuPosition]       = useState({ top: 0, left: 0 });
  const [deleteTarget,       setDeleteTarget]       = useState(null);
  const [deleting,           setDeleting]           = useState(false);
  const [editTarget,         setEditTarget]         = useState(null);
  const [editSaving,         setEditSaving]         = useState(false);

  const menuAnchorRef = useRef(null);
  const dropdownRef   = useRef(null);

  const dispatch = useDispatch();
  const { subAccounts, loading, error, agencyId, rebillingBreakdown, fetchingRebilling } = useSelector(s => s.integrations || {});

  // Map accountId → total rebilled amount
  const rebillMap = React.useMemo(() => {
    const m = {};
    (rebillingBreakdown || []).forEach(r => { m[r.accountId] = r.totalBillable; });
    return m;
  }, [rebillingBreakdown]);

  useEffect(() => {
    dispatch(fetchImportedSubAccounts());
    dispatch(fetchRebillingBreakdown());
  }, [dispatch]);

  useEffect(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const TABS = ["All", "Active", "Favorites", "Archived"];

  const allAccounts = subAccounts || [];

  const getTabAccounts = () => {
    switch (activeTab) {
      case "Favorites": return allAccounts.filter(a => a.isFavorite && !a.isArchived);
      case "Archived":  return allAccounts.filter(a => a.isArchived);
      case "Active":    return allAccounts.filter(a => !a.isArchived);
      default:          return allAccounts;
    }
  };

  const tabCounts = {
    All:       allAccounts.length,
    Active:    allAccounts.filter(a => !a.isArchived).length,
    Favorites: allAccounts.filter(a => a.isFavorite && !a.isArchived).length,
    Archived:  allAccounts.filter(a => a.isArchived).length,
  };

  const filtered = getTabAccounts().filter(acc =>
    !searchQuery ||
    (acc.customName || acc.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.id?.includes(searchQuery)
  );

  const handleAccountClick     = acc => { setSelectedAccount(acc); setIsSidebarOpen(true); setOpenMenuAccountId(null); };
  const handleCloseSidebar     = ()  => { setIsSidebarOpen(false); setSelectedAccount(null); };
  const handleOpenActionMenu   = (e, acc) => {
    e.stopPropagation();
    if (openMenuAccountId === acc.id) { setOpenMenuAccountId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const top  = rect.bottom + window.scrollY + 5;
    setMenuPosition({ top, left: rect.right - 240 });
    setSelectedAccount(acc);
    setOpenMenuAccountId(acc.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteSubAccount(deleteTarget.id)).unwrap();
      toast.success(`"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
      dispatch(fetchImportedSubAccounts());
    } catch (err) {
      toast.error(err || "Failed to delete sub-account.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditSave = async ({ customName, notes }) => {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await dispatch(updateSubAccountMeta({ id: editTarget.id, customName, notes })).unwrap();
      toast.success("Account updated successfully.");
      setEditTarget(null);
    } catch (err) {
      toast.error(err || "Failed to update account.");
    } finally {
      setEditSaving(false);
    }
  };

  const linkToCopy = id =>
    `https://www.yashayah.cloud/app?agencyid=${id}&subaccount={{location.id}}&allow=yes&myname={{user.name}}&myemail={{user.email}}&route=%2Fassistants`;

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 space-y-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sub-accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your GoHighLevel client accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search accounts…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 w-56"
            />
          </div>

          {/* New Sub-account dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> New Sub-account
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 overflow-hidden py-2"
                >
                  <p className="px-4 pt-1 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Add accounts</p>
                  <DropdownItem icon={Link2}         text="Custom menu link"  description="Copy link for GHL agency settings"
                    onClick={() => { copyTextToClipboard(linkToCopy(agencyId)); setIsDropdownOpen(false); }} />
                  <DropdownItem icon={UploadCloud}   text="Import installed"  description="Fetch existing GHL sub-accounts"
                    onClick={() => { setIsImportModalOpen(true); setIsDropdownOpen(false); }} />
                  <DropdownItem icon={Zap}           text="Direct connection" description="Connect a new account directly" onClick={() => setIsDropdownOpen(false)} />
                  <DropdownItem icon={ArrowRightLeft} text="Transfer account" description="Move an account between agencies"  onClick={() => setIsDropdownOpen(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 border-b border-gray-100 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 py-3.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                activeTab === tab ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}{" "}
              <span className={`text-xs ${activeTab === tab ? "text-indigo-400" : "text-gray-400"}`}>
                ({tabCounts[tab] ?? 0})
              </span>
              {activeTab === tab && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rebilled</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-400">
                      <span className="text-sm">Something went wrong loading sub-accounts.</span>
                      <button onClick={() => dispatch(fetchImportedSubAccounts())}
                        className="text-xs text-indigo-600 underline">Retry</button>
                    </div>
                  </td>
                </tr>
              ) : !filtered?.length ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState onImport={() => setIsImportModalOpen(true)} />
                  </td>
                </tr>
              ) : (
                filtered.map((acc, idx) => (
                  <motion.tr
                    key={acc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    onClick={() => handleAccountClick(acc)}
                    className="group hover:bg-indigo-50/40 transition-colors duration-150 cursor-pointer"
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                    </td>

                    {/* Account name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={acc.name} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 leading-tight">
                              {acc.customName || acc.name || "Unnamed Account"}
                            </p>
                            {acc.isFavorite && (
                              <span title="Favorite" className="text-amber-400">★</span>
                            )}
                          </div>
                          {acc.customName && acc.customName !== acc.name && (
                            <p className="text-[10px] text-gray-400 mt-0.5 italic truncate max-w-[180px]">{acc.name}</p>
                          )}
                          {acc.email && !acc.customName && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{acc.email}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location ID */}
                    <td className="px-4 py-3.5">
                      <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg font-mono">
                        {acc.id?.slice(0, 6)}…{acc.id?.slice(-4)}
                      </code>
                    </td>

                    {/* Rebilled (usage × rebilling price) */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {fetchingRebilling
                            ? <span className="inline-block w-10 h-3 bg-gray-100 rounded animate-pulse" />
                            : `$${(rebillMap[acc.id] ?? 0).toFixed(2)}`}
                        </span>
                      </div>
                    </td>

                    {/* Status — real connection state */}
                    <td className="px-4 py-3.5">
                      {acc.connected === false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Reconnect needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Connected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Users"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleOpenActionMenu(e, acc)}
                          ref={openMenuAccountId === acc.id ? menuAnchorRef : null}
                          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="More"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteTarget(acc); }}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer row count */}
        {!loading && !!filtered?.length && (
          <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-medium text-gray-600">{filtered.length}</span> account{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <FolderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ImportSubaccountsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <DeleteConfirmDialog
        account={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
      <AccountDetailSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} account={selectedAccount} />
      {openMenuAccountId && selectedAccount && (
        <AccountActionsMenu
          isOpen
          onClose={() => setOpenMenuAccountId(null)}
          account={selectedAccount}
          position={menuPosition}
          anchorRef={menuAnchorRef}
          onEdit={(acc) => setEditTarget(acc)}
        />
      )}
      <EditAccountModal
        account={editTarget}
        onSave={handleEditSave}
        onCancel={() => setEditTarget(null)}
        saving={editSaving}
      />
    </div>
  );
}

export default SubAccounts;
