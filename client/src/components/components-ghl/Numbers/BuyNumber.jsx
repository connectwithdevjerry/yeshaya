// src/components/components-ghl/Numbers/BuyNumber.jsx
import React, { useState, useEffect } from "react";
import {
  X, MessageSquare, Phone, Volume2, Loader2, ShoppingCart,
  ChevronDown, ChevronLeft, ChevronRight, Search, Bot, Check,
  MapPin, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchAvailableNumbers, buyNumber } from "../../../store/slices/numberSlice";
import { fetchAssistants } from "../../../store/slices/assistantsSlice";
import toast from "react-hot-toast";

<<<<<<< HEAD
const getCapabilityIcons = (capabilities) => {
  if (!capabilities) return [];
  const icons = [];
=======
const capIcons = (caps) => [
  caps?.voice && { Icon: Phone,        label: "Voice", color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
  caps?.SMS   && { Icon: MessageSquare, label: "SMS",   color: "text-sky-500 bg-sky-50 border-sky-100" },
  caps?.MMS   && { Icon: Volume2,       label: "MMS",   color: "text-violet-500 bg-violet-50 border-violet-100" },
].filter(Boolean);
>>>>>>> projects-ui

const ITEMS_PER_PAGE = 10;

const BuyNumberModal = ({ isOpen, onClose, onBought }) => {
  const [areaCode,          setAreaCode]          = useState("");
  const [selectedNumber,    setSelectedNumber]    = useState(null);
  const [selectedAssistant, setSelectedAssistant] = useState("");
<<<<<<< HEAD
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [buyingNumber, setBuyingNumber] = useState(false);

  const dispatch = useDispatch();
  const {
    data: availableNumbers,
    loading,
    error,
  } = useSelector((state) => state.numbers);
  const { data: assistants, loading: assistantsLoading } = useSelector(
    (state) => state.assistants
  );

  const searchParams = new URLSearchParams(window.location.search);
  const urlSubaccountId = searchParams.get("subaccount");
  const activeSubaccountId = urlSubaccountId || localStorage.getItem("selectedSubaccountId");

  // ✅ Fetch numbers and assistants when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAvailableNumbers());

      if (activeSubaccountId) {
        dispatch(fetchAssistants(activeSubaccountId));
      }
    }
  }, [isOpen, activeSubaccountId, dispatch]);
=======
  const [currentPage,       setCurrentPage]       = useState(1);
  const [buyingNumber,      setBuyingNumber]      = useState(false);

  const dispatch     = useDispatch();
  const { data: availableNumbers, loading, error } = useSelector((s) => s.numbers);
  const { data: assistants, loading: assistantsLoading } = useSelector((s) => s.assistants);
  const searchParams = new URLSearchParams(window.location.search);
  const subaccountId = searchParams.get("subaccount");
>>>>>>> projects-ui

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAvailableNumbers());
      const sid = localStorage.getItem("selectedSubaccountId");
      if (sid) dispatch(fetchAssistants(sid));
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!isOpen) { setAreaCode(""); setSelectedNumber(null); setSelectedAssistant(""); setCurrentPage(1); }
  }, [isOpen]);

  const filtered    = areaCode.trim()
    ? availableNumbers.filter((n) => n.phoneNumber.includes(areaCode.replace(/\D/g, "")))
    : availableNumbers;
  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start       = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated   = filtered.slice(start, start + ITEMS_PER_PAGE);

  const handleBuy = async () => {
<<<<<<< HEAD
    if (selectedNumber && selectedAssistant && activeSubaccountId) {
      setBuyingNumber(true);

      try {
        const resultAction = await dispatch(
          buyNumber({
            subaccountId: activeSubaccountId,
            assistantId: selectedAssistant,
            number: selectedNumber.phoneNumber,
          })
        );

        if (buyNumber.fulfilled.match(resultAction)) {
          console.log(
            "✅ Number purchased successfully:",
            resultAction.payload
          );
          toast.success("Number purchased successfully");
          // Optionally refresh the available numbers list
          dispatch(fetchAvailableNumbers());
          onClose();
        } else {
          console.error("❌ Failed to buy number:", resultAction.payload);
          toast.error(`Failed to buy number: ${resultAction.payload}`);
        }
      } catch (error) {
        console.error("❌ Error buying number:", error);
        toast.error("An error occurred while buying the number");
      } finally {
        setBuyingNumber(false);
      }
    } else {
      if (!activeSubaccountId) {
        toast.error("Subaccount ID is missing. Please select a subaccount.");
=======
    if (!selectedNumber || !selectedAssistant) return;
    if (!subaccountId) { toast.error("No subaccount selected"); return; }
    setBuyingNumber(true);
    try {
      const result = await dispatch(buyNumber({ subaccountId, assistantId: selectedAssistant, number: selectedNumber.phoneNumber }));
      if (buyNumber.fulfilled.match(result)) {
        toast.success(`${selectedNumber.friendlyName} purchased!`);
        dispatch(fetchAvailableNumbers());
        onBought?.();
        onClose();
      } else {
        toast.error(result.payload || "Failed to buy number");
>>>>>>> projects-ui
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setBuyingNumber(false);
    }
  };

  const canBuy = selectedNumber && selectedAssistant && !buyingNumber;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Buy a Phone Number</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Search and purchase a US number</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search controls */}
            <div className="px-6 py-4 border-b border-gray-100 space-y-3 flex-shrink-0 bg-gray-50/30">
              {/* Assistant selector */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Bot className="w-3 h-3" /> Assign to Assistant <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedAssistant}
                    onChange={(e) => setSelectedAssistant(e.target.value)}
                    disabled={assistantsLoading}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none appearance-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed pr-8"
                  >
                    <option value="">{assistantsLoading ? "Loading assistants…" : "Choose an assistant"}</option>
                    {assistants.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {assistants.length === 0 && !assistantsLoading && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertCircle className="w-3 h-3" /> No assistants found — create one first.
                  </p>
                )}
              </div>

              {/* Area code search */}
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Area Code (US only)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                    <input
                      type="text"
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
                      placeholder="e.g. 212"
                      maxLength={3}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-300"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage(1)}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 transition-all"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Search
                </motion.button>
              </div>
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-gray-50 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500">Available Numbers</span>
              <span className="text-xs text-gray-400">{filtered.length} results</span>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16 gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-sm text-gray-500">Searching numbers…</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-16 text-rose-500 text-sm">{error}</div>
              ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No numbers for that area code</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-50/90 backdrop-blur border-b border-gray-100">
                      {["Number", "Location", "Capabilities", "Available"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {paginated.map((item, i) => {
                        const caps    = capIcons(item.capabilities);
                        const active  = selectedNumber?.phoneNumber === item.phoneNumber;
                        return (
                          <motion.tr
                            key={item.phoneNumber}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => setSelectedNumber(item)}
                            className={`cursor-pointer transition-all ${
                              active
                                ? "bg-indigo-50/60 border-l-2 border-l-indigo-500"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                {active && <Check className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />}
                                <div>
                                  <p className="text-sm font-bold text-gray-800">{item.friendlyName}</p>
                                  <p className="text-xs font-mono text-gray-400">{item.phoneNumber}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <MapPin className="w-3 h-3 text-gray-300" />
                                <span>{[item.locality, item.region].filter(Boolean).join(", ") || "—"}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1">
                                {caps.map(({ Icon, label, color }) => (
                                  <span key={label} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${color}`}>
                                    <Icon className="w-3 h-3" /> {label}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Available
                              </span>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && paginated.length > 0 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50/30 flex-shrink-0">
                <span className="text-xs text-gray-400">
                  {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="text-xs space-y-0.5">
                {selectedNumber && (
                  <p className="text-gray-600">
                    Number: <span className="font-mono font-semibold text-indigo-600">{selectedNumber.friendlyName}</span>
                  </p>
                )}
                {selectedAssistant && (
                  <p className="text-gray-600">
                    Assistant: <span className="font-semibold text-indigo-600">{assistants.find((a) => a.id === selectedAssistant)?.name}</span>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
                  Cancel
                </button>
                <motion.button
                  onClick={handleBuy}
                  disabled={!canBuy}
                  whileHover={canBuy ? { scale: 1.02 } : {}}
                  whileTap={canBuy ? { scale: 0.98 } : {}}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {buyingNumber
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buying…</>
                    : <><ShoppingCart className="w-3.5 h-3.5" /> Buy Number</>
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BuyNumberModal;
