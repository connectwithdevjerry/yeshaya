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


  // Fetch user details on mount
  useEffect(() => {
    dispatch(getUserDetails());
  }, [dispatch]);
  // Step 1: Fetch all subaccounts on mount
  useEffect(() => {
    const getSubAccounts = async () => {
      try {
        setLoadingData(true);
        console.log("🔄 Fetching all subaccounts...");
        
        const result = await dispatch(fetchSubAccounts()).unwrap();
        
        // Get all subaccounts from the fetched data
        const fetchedSubaccounts = result?.locations || [];
        
        if (fetchedSubaccounts.length > 0) {
          console.log("✅ Subaccounts fetched:", fetchedSubaccounts.length);
          setSubaccounts(fetchedSubaccounts);
        } else {
          console.log("⚠️ No subaccounts found");
          setSubaccounts([]);
        }
      } catch (error) {
        console.error("❌ Error fetching subaccounts:", error);
        setSubaccounts([]);
      } finally {
        setLoadingData(false);
      }
    };

    getSubAccounts();
  }, [dispatch]);

  // Step 2: Fetch assistants for ALL subaccounts
  useEffect(() => {
    const getAllAssistants = async () => {
      if (subaccounts.length > 0 && allAssistants.length === 0) {
        try {
          setLoadingData(true);
          console.log("🔄 Fetching assistants for all subaccounts...");
          
          // Fetch assistants for each subaccount in parallel
          const promises = subaccounts.map((subaccount) =>
            dispatch(fetchAssistants(subaccount.id)).unwrap()
          );

          const results = await Promise.all(promises);
          
          // Combine all assistants from all subaccounts
          const combined = results.flatMap((assistants, index) =>
            (assistants || []).map((assistant) => ({
              ...assistant,
              subaccountId: subaccounts[index].id,
              subaccountName: subaccounts[index].name || subaccounts[index].companyName,
            }))
          );

          if (combined.length > 0) {
            console.log("✅ Total assistants fetched:", combined.length);
            setAllAssistants(combined);
          } else {
            console.log("⚠️ No assistants found across all subaccounts");
            setAllAssistants([]);
          }
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

  // Step 3: Fetch purchased numbers for ALL assistants across ALL subaccounts
  useEffect(() => {
    const fetchAllNumbers = async () => {
      if (allAssistants.length > 0 && !numbersFetched) {
        try {
          console.log("🔄 Fetching purchased numbers for all assistants across all subaccounts...");
          setNumbersFetched(true); // Prevent re-fetching
          
          // Fetch numbers for each assistant in parallel
          const promises = allAssistants.map((assistant) =>
            dispatch(
              fetchPurchasedNumbers({
                subaccountId: assistant.subaccountId,
                assistantId: assistant.id || assistant.assistantId,
              })
            )
          );

          await Promise.all(promises);
          console.log("✅ All purchased numbers fetched for all subaccounts");
        } catch (error) {
          console.error("❌ Error fetching numbers:", error);
          // Reset flag on error to allow retry
          setNumbersFetched(false);
        }
      }
    };

    fetchAllNumbers();
  }, [dispatch, allAssistants, numbersFetched]);

  // Calculate total unique numbers using memoization
  const totalNumbers = useMemo(() => {
    if (!purchasedNumbers || purchasedNumbers.length === 0) {
      return 0;
    }

    // Remove duplicates based on phone number SID
    const uniqueNumbers = purchasedNumbers.reduce((acc, current) => {
      const sid = current.phoneNumberDetails?.sid || current.sid;
      const exists = acc.find((item) => {
        const itemSid = item.phoneNumberDetails?.sid || item.sid;
        return itemSid === sid;
      });
      
      if (!exists && sid) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log("📊 Total unique numbers:", uniqueNumbers.length);
    return uniqueNumbers.length;
  }, [purchasedNumbers]);

  const goToBilling = () => {
    navigate("/settings?tab=billing");
  };

  const isLoading = loadingData || loadingPurchased;

  return (
    <div className="p-4 border-t border-gray-200 space-y-3">
      <Link
        to="/settings"
        className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
      >
        <Settings className="w-5 h-5" />
        <span className="text-sm font-medium">Settings</span>
      </Link>

      <div className="space-y-2">
        <div
          onClick={goToBilling}
          className="flex hover:bg-gray-100 rounded-md items-center justify-between px-3 py-2 cursor-pointer transition-colors"
        >
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Balance</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {balance || "$0.00"}
          </span>
        </div>

        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Numbers</span>
            <HelpCircle className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-sm font-semibold text-gray-900 flex items-center">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              totalNumbers
            )}
          </span>
        </div>
      </div>

      <div
        className="relative flex items-center space-x-2 px-3 py-2 bg-gray-100 cursor-pointer rounded-lg hover:bg-gray-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shrink-0">
          {/* Use the first letter of firstName or email */}
          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-900 truncate">
            {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {user?.email || "No email"}
          </div>
        </div>
        
        <ChevronLeft className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-20 left-0 mb-2 z-50">
            <UserMenuPopup />
          </div>
        </>
      )}
    </div>
  );
}