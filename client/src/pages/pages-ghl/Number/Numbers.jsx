// src/pages/pages-ghl/Number/Numbers.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search, ChevronLeft, ChevronRight, Upload, ShoppingCart,
  Loader2, Phone, MoreHorizontal, CheckCircle2, XCircle,
  Home, Wifi, WifiOff, Hash, Layers, PhoneIncoming,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import ImportNumberModal from "../../../components/components-ghl/Numbers/ImportNumber";
import BuyNumberModal from "../../../components/components-ghl/Numbers/BuyNumber";
import {
  fetchPurchasedNumbers,
  getVapiConnectionStatus,
} from "../../../store/slices/numberSlice";
import { fetchAssistants } from "../../../store/slices/assistantsSlice";
import NumbersActionsMenu from "../../../components/components-ghl/Numbers/NumberActionsMenu";

/* ── Capability pills ── */
const CAP_STYLE = {
  Voice: "bg-indigo-50 text-indigo-600 border-indigo-100",
  SMS:   "bg-sky-50 text-sky-600 border-sky-100",
  MMS:   "bg-violet-50 text-violet-600 border-violet-100",
};
const CapPill = ({ label }) => (
  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${CAP_STYLE[label] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
    {label}
  </span>
);

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const active = status === "in-use";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${
      active ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-gray-50 text-gray-500 border-gray-100"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-gray-300"}`} />
      {status || "N/A"}
    </span>
  );
};

/* ── Vapi badge ── */
const VapiBadge = ({ phoneSid, vapiStatuses }) => {
  const info = vapiStatuses?.[phoneSid];
  if (!info) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-gray-50 text-gray-400 border border-gray-100">
      <WifiOff className="w-3 h-3" /> Not Connected
    </span>
  );
  if (info.checking || typeof info.isConnected === "undefined") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-gray-50 text-gray-400 border border-gray-100">
      <Loader2 className="w-3 h-3 animate-spin" /> Checking…
    </span>
  );
  return info.isConnected === true ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <Wifi className="w-3 h-3" /> Connected
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100">
      <WifiOff className="w-3 h-3" /> Not Connected
    </span>
  );
};

/* ── Skeleton row ── */
const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 bg-gray-100 rounded-full animate-pulse" style={{ width: `${60 + (i * 13) % 30}%` }} />
      </td>
    ))}
  </tr>
);

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, gradient, soft, text, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.07 }}
    className="relative bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-hidden"
  >
    <div className={`absolute top-3 right-3 w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} opacity-10`} />
    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-sm`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
  </motion.div>
);

/* ── TABS ── */
const TABS = [
  { id: "all",      label: "All"      },
  { id: "bought",   label: "Bought"   },
  { id: "imported", label: "Imported" },
];

const COLS = ["Name", "Number", "Updated", "Capabilities", "Status", "Assistant", "Connection", ""];

const Numbers = () => {
  const [isImportModalOpen,  setIsImportModalOpen]  = useState(false);
  const [isBuyModalOpen,     setIsBuyModalOpen]     = useState(false);
  const [activeTab,          setActiveTab]          = useState("all");
  const [allPurchasedNumbers,setAllPurchasedNumbers]= useState([]);
  const [loading,            setLoading]            = useState(false);
  const [selectedAccount,    setSelectedAccount]    = useState(null);
  const [openMenuAccountId,  setOpenMenuAccountId]  = useState(null);
  const [menuPosition,       setMenuPosition]       = useState({ top: 0, left: 0 });
  const [currentPage,        setCurrentPage]        = useState(1);
  const [rowsPerPage,        setRowsPerPage]        = useState(10);
  const [searchTerm,         setSearchTerm]         = useState("");
  const menuAnchorRef = useRef(null);

  const dispatch  = useDispatch();
  const searchParams  = new URLSearchParams(window.location.search);
  const subaccountId  = searchParams.get("subaccount");

  const { data: assistants }   = useSelector((s) => s.assistants);
  const { vapiStatuses }       = useSelector((s) => s.numbers);

  useEffect(() => {
    if (subaccountId) dispatch(fetchAssistants(subaccountId));
  }, [dispatch, subaccountId]);

  useEffect(() => {
    const fetchAllNumbers = async () => {
      if (!subaccountId || assistants.length === 0) return;
      setLoading(true);
      try {
        const results = await Promise.all(
          assistants.map((a) => dispatch(fetchPurchasedNumbers({ subaccountId, assistantId: a.id })).unwrap())
        );
        const combined = results.flatMap((nums, i) =>
          nums.map((n) => ({ ...n, assistantId: assistants[i].id, assistantName: assistants[i].name }))
        );
        const unique = combined.reduce((acc, cur) => {
          if (!acc.find((x) => x.phoneNumberDetails?.sid === cur.phoneNumberDetails?.sid)) acc.push(cur);
          return acc;
        }, []);
        setAllPurchasedNumbers(unique);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllNumbers();
  }, [dispatch, subaccountId, assistants]);

  useEffect(() => {
    if (allPurchasedNumbers.length === 0 || !subaccountId) return;
    allPurchasedNumbers.forEach((item) => {
      const d = item.phoneNumberDetails;
      if (!d?.sid || !d?.phoneNumber) return;
      dispatch(getVapiConnectionStatus({
        phoneNum: d.phoneNumber, subaccountId, assistantId: item.assistantId, phoneSid: d.sid, number: d.phoneNumber,
      }));
    });
  }, [allPurchasedNumbers.length, subaccountId, dispatch]);

  const getFiltered = () => {
    let list = allPurchasedNumbers;
    if (activeTab === "bought")   list = list.filter((n) => n.phoneNumberDetails?.origin === "twilio");
    if (activeTab === "imported") list = list.filter((n) => n.phoneNumberDetails?.origin !== "twilio");

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((n) => {
        const d = n.phoneNumberDetails || {};
        return (
          (d.phoneNumber || "").toLowerCase().includes(q) ||
          (d.friendlyName || "").toLowerCase().includes(q) ||
          (n.assistantName || "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  };
  const filtered    = getFiltered();
  const totalPages  = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage    = Math.min(currentPage, totalPages);
  const paginated   = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleTabChange = (id) => { setActiveTab(id); setCurrentPage(1); };
  const handleRowsChange = (e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  const fmtCaps = (caps) => {
    if (!caps) return [];
    return [caps.voice && "Voice", caps.sms && "SMS", caps.mms && "MMS"].filter(Boolean);
  };

  const handleOpenMenu = (e, item) => {
    e.stopPropagation();
    const d = item.phoneNumberDetails;
    if (openMenuAccountId === d.sid) { setOpenMenuAccountId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const top  = rect.bottom + 5 + 350 > window.innerHeight && rect.top > 350 ? rect.top - 355 : rect.bottom + 5;
    setMenuPosition({ top, left: rect.right - 220 });
    setSelectedAccount({ id: d.sid, companyId: subaccountId, name: d.friendlyName || "Unknown", email: "", phoneNumber: d.phoneNumber, assistantId: item.assistantId, assistantName: item.assistantName });
    setOpenMenuAccountId(d.sid);
  };

  /* stats */
  const connectedCount  = allPurchasedNumbers.filter((n) => vapiStatuses?.[n.phoneNumberDetails?.sid]?.isConnected === true).length;
  const boughtCount     = allPurchasedNumbers.filter((n) => n.phoneNumberDetails?.origin === "twilio").length;
  const importedCount   = allPurchasedNumbers.filter((n) => n.phoneNumberDetails?.origin !== "twilio").length;

  const stats = [
    { icon: Hash,         label: "Total Numbers",    value: allPurchasedNumbers.length, gradient: "from-indigo-500 to-violet-600" },
    { icon: ShoppingCart, label: "Bought",            value: boughtCount,                gradient: "from-sky-500 to-cyan-500" },
    { icon: Upload,       label: "Imported",          value: importedCount,              gradient: "from-amber-500 to-orange-500" },
    { icon: Wifi,         label: "Connected",          value: connectedCount,             gradient: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="flex-grow bg-gray-50/40 p-6 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-500" /> Phone Numbers
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage your purchased and imported numbers</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Upload className="w-4 h-4" /> Import Number
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setIsBuyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all"
            >
              <ShoppingCart className="w-4 h-4" /> Buy Number
            </motion.button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* ── Main card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-4 pt-3 gap-1">
            {TABS.map(({ id, label }) => {
              const count = id === "all" ? allPurchasedNumbers.length :
                            id === "bought" ? boughtCount : importedCount;
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => handleTabChange(id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
                    active ? "text-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${
                    active ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
                  }`}>{count}</span>
                  {active && (
                    <motion.span layoutId="tab-line"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-gradient-to-r from-indigo-500 to-violet-600"
                    />
                  )}
                </button>
              );
            })}
            <div className="ml-auto flex items-center pb-2 pr-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Home className="w-3 h-3" />
                <span>Home</span>
                <span>/</span>
                <span className="text-gray-600 font-medium">Numbers</span>
              </div>
            </div>
          </div>

          {/* Count bar + search */}
          <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-gray-50 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-600">{allPurchasedNumbers.length}</span> numbers
            </p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search number, name, assistant…"
                className="pl-8 pr-3 py-1.5 w-64 rounded-lg border border-gray-200 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/60 border-b border-gray-100">
                  {COLS.map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={COLS.length} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLS.length} className="px-6 py-20 text-center">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Phone className="w-7 h-7 text-white" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-700">No numbers yet</p>
                          <p className="text-xs text-gray-400 mt-1">Import or buy a phone number to get started.</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                          >
                            <Upload className="w-3 h-3" /> Import
                          </button>
                          <button onClick={() => setIsBuyModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all"
                          >
                            <ShoppingCart className="w-3 h-3" /> Buy Number
                          </button>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {paginated.map((item, idx) => {
                      const d = item.phoneNumberDetails;
                      return (
                        <motion.tr
                          key={`${d.sid}-${idx}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="hover:bg-indigo-50/20 transition-colors group"
                        >
                          {/* Name */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                                <Phone className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-800">{d.friendlyName || "—"}</span>
                            </div>
                          </td>
                          {/* Number */}
                          <td className="px-5 py-3.5">
                            <span className="text-sm font-mono text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
                              {d.phoneNumber || "—"}
                            </span>
                          </td>
                          {/* Updated */}
                          <td className="px-5 py-3.5 text-xs text-gray-400">
                            {d.dateUpdated ? new Date(d.dateUpdated).toLocaleDateString() : "—"}
                          </td>
                          {/* Capabilities */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {fmtCaps(d.capabilities).map((c) => <CapPill key={c} label={c} />)}
                              {fmtCaps(d.capabilities).length === 0 && <span className="text-xs text-gray-400">—</span>}
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                          {/* Assistant */}
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                              {item.assistantName || "—"}
                            </span>
                          </td>
                          {/* Connection */}
                          <td className="px-5 py-3.5"><VapiBadge phoneSid={d.sid} vapiStatuses={vapiStatuses} /></td>
                          {/* Actions */}
                          <td className="px-5 py-3.5">
                            <motion.button
                              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                              onClick={(e) => handleOpenMenu(e, item)}
                              ref={openMenuAccountId === d.sid ? menuAnchorRef : null}
                              className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer — live pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 bg-gray-50/30">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <select
                  value={rowsPerPage}
                  onChange={handleRowsChange}
                  className="pl-2 pr-6 py-1 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white cursor-pointer"
                >
                  {[10, 25, 50].map((n) => <option key={n} value={n}>{n} rows</option>)}
                </select>
                <span>
                  Showing{" "}
                  <span className="font-semibold text-gray-600">
                    {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}
                  </span>{" "}
                  of <span className="font-semibold text-gray-600">{filtered.length}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Page {safePage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportNumberModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <BuyNumberModal    isOpen={isBuyModalOpen}    onClose={() => setIsBuyModalOpen(false)} />
      {openMenuAccountId && selectedAccount && (
        <NumbersActionsMenu
          isOpen={true}
          onClose={() => setOpenMenuAccountId(null)}
          account={selectedAccount}
          position={menuPosition}
          anchorRef={menuAnchorRef}
        />
      )}
    </div>
  );
};

export default Numbers;
