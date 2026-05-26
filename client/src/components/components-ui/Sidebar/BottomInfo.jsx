import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Settings,
  HelpCircle,
  CreditCard,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserMenuPopup from "../UserMenu";
import { fetchAssistants } from "../../../store/slices/assistantsSlice";
import { fetchPurchasedNumbers } from "../../../store/slices/numberSlice";
import { fetchSubAccounts } from "../../../store/slices/integrationSlice";
import { getUserDetails } from "../../../store/slices/authSlice";
import { AnimatePresence, motion } from "framer-motion";

export function BottomInfo({ balance, currentUser }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [subaccounts, setSubaccounts] = useState([]);
  const [allAssistants, setAllAssistants] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [numbersFetched, setNumbersFetched] = useState(false);
  const { purchasedNumbers, loadingPurchased } = useSelector((state) => state.numbers);
  const { user, loading: userLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);

  useEffect(() => {
    const getSubAccounts = async () => {
      try {
        setLoadingData(true);
        const result = await dispatch(fetchSubAccounts()).unwrap();
        setSubaccounts(result?.locations || []);
      } catch (error) {
        console.error("❌ Error fetching subaccounts:", error);
        setSubaccounts([]);
      } finally {
        setLoadingData(false);
      }
    };
    getSubAccounts();
  }, [dispatch]);

  useEffect(() => {
    const getAllAssistants = async () => {
      if (subaccounts.length > 0 && allAssistants.length === 0) {
        try {
          setLoadingData(true);
          const promises = subaccounts.map((s) =>
            dispatch(fetchAssistants(s.id)).unwrap()
          );
          const results = await Promise.all(promises);
          const combined = results.flatMap((assistants, index) =>
            (assistants || []).map((assistant) => ({
              ...assistant,
              subaccountId: subaccounts[index].id,
              subaccountName: subaccounts[index].name || subaccounts[index].companyName,
            }))
          );
          setAllAssistants(combined);
        } catch (error) {
          console.error("❌ Error fetching assistants:", error);
          setAllAssistants([]);
        } finally {
          setLoadingData(false);
        }
      }
    };
    getAllAssistants();
  }, [dispatch, subaccounts, allAssistants.length]);

  useEffect(() => {
    const fetchAllNumbers = async () => {
      if (allAssistants.length > 0 && !numbersFetched) {
        try {
          setNumbersFetched(true);
          const promises = allAssistants.map((assistant) =>
            dispatch(
              fetchPurchasedNumbers({
                subaccountId: assistant.subaccountId,
                assistantId: assistant.id || assistant.assistantId,
              })
            )
          );
          await Promise.all(promises);
        } catch (error) {
          console.error("❌ Error fetching numbers:", error);
          setNumbersFetched(false);
        }
      }
    };
    fetchAllNumbers();
  }, [dispatch, allAssistants, numbersFetched]);

  const totalNumbers = useMemo(() => {
    if (!purchasedNumbers || purchasedNumbers.length === 0) return 0;
    const uniqueNumbers = purchasedNumbers.reduce((acc, current) => {
      const sid = current.phoneNumberDetails?.sid || current.sid;
      const exists = acc.find((item) => {
        const itemSid = item.phoneNumberDetails?.sid || item.sid;
        return itemSid === sid;
      });
      if (!exists && sid) acc.push(current);
      return acc;
    }, []);
    return uniqueNumbers.length;
  }, [purchasedNumbers]);

  const goToBilling = () => navigate("/settings?tab=billing");
  const isLoading = loadingData || loadingPurchased;

  return (
    <div className="p-4 border-t border-slate-800 space-y-3">
      <Link
        to="/settings"
        className="flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg w-full transition-all duration-200"
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm font-medium">Settings</span>
      </Link>

      <div className="space-y-1">
        <div
          onClick={goToBilling}
          className="flex hover:bg-slate-800 rounded-md items-center justify-between px-3 py-2 cursor-pointer transition-colors"
        >
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">Balance</span>
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-sm font-semibold text-white">{balance || "$0.00"}</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium text-slate-300">Numbers</span>
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-sm font-semibold text-white flex items-center">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              totalNumbers
            )}
          </span>
        </div>
      </div>

      <div className="relative">
        <div
          className="flex items-center space-x-2 px-3 py-2 bg-slate-800 cursor-pointer rounded-lg hover:bg-slate-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-violet-600 rounded flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {user?.email || "No email"}
            </div>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 z-50"
              >
                <UserMenuPopup />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
