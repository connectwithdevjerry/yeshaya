// src/pages/pages-ui/Dashboard.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  DollarSign,
  Info,
  Link,
  RefreshCcw,
  SquareStack,
  Zap,
  HardDriveDownload,
  CreditCard,
  PlusCircle,
  Link2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../store/api/config";
import { fetchSubAccounts } from "../../store/slices/integrationSlice";
import { fetchWalletBalance } from "../../store/slices/assistantsSlice";


function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { subAccounts } = useSelector((state) => state.integrations || {});
  const { balance } = useSelector((state) => state.wallet || {});
  const { user } = useSelector((state) => state.auth || {});
  
  const [isResetting, setIsResetting] = useState(false);
  const [customMenuLink, setCustomMenuLink] = useState("");

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchSubAccounts());
    dispatch(fetchWalletBalance());
    generateCustomMenuLink();
  }, [dispatch]);


  // Generate custom menu link
  const generateCustomMenuLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/app?agencyid={{agency.id}}&subaccount={{location.id}}&allow=yes&myname={{location.name}}&myemail={{user.email}}&route=/assistants`;
    setCustomMenuLink(link);
  };

  // Copy custom menu link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(customMenuLink);
    toast.success("Custom menu link copied to clipboard!");
  };

  // Reset GHL connection
  const handleResetConnection = async () => {
    if (!window.confirm("Are you sure you want to reset your GoHighLevel connection? This will disconnect your agency integration.")) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await apiClient.post("/integrations/reset-ghl-connection");
      
      if (response.data?.success) {
        toast.success("GoHighLevel connection reset successfully!");
        
        // Clear any stored data
        localStorage.removeItem("ghl_pending_locationId");
        sessionStorage.removeItem("ghl_locationId");
        sessionStorage.removeItem("ghl_captureTime");
        
        // Refresh subaccounts
        dispatch(fetchSubAccounts());
        
        // Optionally redirect to integrations page
        setTimeout(() => {
          navigate("/integrations");
        }, 1500);
      } else {
        toast.error(response.data?.message || "Failed to reset connection");
      }
    } catch (error) {
      console.error("Failed to reset GHL connection:", error);
      toast.error(error.response?.data?.message || "Failed to reset connection");
    } finally {
      setIsResetting(false);
    }
  };

  // Calculate dynamic values
  const totalSubAccounts = subAccounts?.length || 0;
  const walletBalance = balance || 0;
  const activeAssistants = 0;
  const totalCalls =  0;
  const totalSpent =  0;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="flex-1 flex flex-col">
        {/* Dashboard Content */}
        <main className="flex-1 p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Hey {user?.name || 'there'} 👋
              </h1>
              <p className="text-gray-600">
                Let's scale your service offering with voice and chat AI 🤖
              </p>
              {/* Stat Cards */}
              <div className="flex flex-wrap gap-2 mt-4 items-center">
                {/* Active Assistants */}
                <div className="bg-white items-center gap-2 p-3 rounded-lg shadow-sm flex">
                  <Zap size={38} className="text-gray-200 p-2 bg-orange-500 rounded-xl" />
                  <div>
                    <p className="text-xs text-gray-500">Assistants</p>
                    <p className="text-2xl font-bold text-gray-900">{activeAssistants}</p>
                  </div>
                </div>

                {/* Sub-accounts */}
                <div className="bg-white items-center gap-2 p-3 rounded-lg shadow-sm flex">
                  <Users size={38} className="bg-violet-500 text-gray-200 p-2 rounded-xl" />
                  <div>
                    <p className="text-xs text-gray-500">Sub-accounts</p>
                    <div className="text-2xl font-bold text-gray-900">{totalSubAccounts}</div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-white items-center gap-2 p-3 rounded-lg shadow-sm flex">
                  <HardDriveDownload
                    size={38}
                    className="bg-green-500 text-gray-200 p-2 rounded-xl"
                  />
                  <div>
                    <p className="text-xs text-gray-500">Wallet</p>
                    <div className="text-2xl font-bold text-gray-900">
                      ${walletBalance.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Total Spent */}
                <div className="bg-white items-center gap-2 p-3 rounded-lg shadow-sm flex">
                  <DollarSign size={38} className="bg-red-500 text-gray-200 p-2 rounded-xl" />
                  <div>
                    <p className="text-xs text-gray-500">Total Spent</p>
                    <div className="text-2xl font-bold text-gray-900">
                      ${totalSpent.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Total Calls */}
                <div className="bg-white items-center gap-2 p-3 rounded-lg shadow-sm flex">
                  <SquareStack size={38} className="bg-purple-500 text-gray-200 p-2 rounded-xl" />
                  <div>
                    <p className="text-xs text-gray-500">Calls</p>
                    <div className="text-2xl font-bold text-gray-900">{totalCalls}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              {/* Quick Links - visible on larger screens */}
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Quick Links
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/integrations"
                    className="flex items-center gap-2 text-indigo-600 hover:bg-gray-200 text-sm"
                  >
                    <Link size={16} /> Connect to GoHighLevel
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    className="flex items-center gap-2 text-indigo-600 hover:bg-gray-200 text-sm"
                  >
                    <PlusCircle size={16} /> Create Sub-account
                  </a>
                </li>
                <li>
                  <a
                    href="/rebilling"
                    className="flex items-center gap-2 text-indigo-600 hover:bg-gray-200 text-sm"
                  >
                    <CreditCard size={16} /> Start Re-billing
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GoHighLevel Agency Integration Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  GoHighLevel Agency Integration
                </h3>
              </div>
              <button
                onClick={handleResetConnection}
                disabled={isResetting}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCcw
                  size={16}
                  className={`inline-block mr-2 ${isResetting ? "animate-spin" : ""}`}
                />
                {isResetting ? "Resetting..." : "Reset connection"}
              </button>
              <div className="bg-blue-50 border-blue-200 border-l-4 p-4 rounded-r-md">
                <div className="flex items-start gap-2 text-blue-800 text-sm">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Important: If you have trouble connecting to GoHighLevel,
                      please try an incognito window.
                    </p>
                    <p>
                      Make sure to connect to your{" "}
                      <a href="/integrations" className="underline font-medium">
                        agency
                      </a>
                      , not sub-account, for us to create accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Menu Link Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Link2 size={20} className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Custom menu link
                  </h3>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Copy Custom Menu Link
                </button>
              </div>
              
              {/* Display the custom menu link */}
              <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                <code className="text-xs text-gray-700 break-all">
                  {customMenuLink}
                </code>
              </div>

              <div className="bg-green-50 border-green-200 border-l-4 p-4 rounded-r-md">
                <div className="flex items-start gap-2 text-green-800 text-sm">
                  <Info size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      Important: Add your custom menu link to GoHighLevel in the
                      agency settings, your account will be created on viewing.
                    </p>
                    <p>
                      Do not replace the variable in the URL. Make sure to
                      toggle for{" "}
                      <span className="font-medium">sub-account</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;