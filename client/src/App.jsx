// src/App.jsx
import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Sidebar } from "./components/components-ui/Sidebar/Sidebar";
import { SidebarGHL } from "./components/components-ghl/Sidebar/Sidebar";
import {
  userInfo as defaultUserInfo,
  navigationItems,
} from "./data/accountsData-ui";
import { navigationGHLItems } from "./data/accountsData-ghl";
import MainContent from "./MainContent";
import ProtectedRoute from "./ProtectedRoutes";
import { verifyToken } from "./store/slices/authSlice";
import { useCurrentAccount } from "./hooks/useCurrentAccount";
import { Toaster } from "react-hot-toast";
import { GHLLocationCapture } from "./GHLLocationCapture.jsx";
import apiClient from "./store/api/config.js";

// Auth pages
import Login from "./pages/pages-ui/Login";
import Register from "./pages/pages-ui/Register";
import ResetLink from "./pages/pages-ui/ResetLink";
import VerifyEmail from "./pages/pages-ui/VerifyEmail";
import HomePage from "./pages/pages-ghl/Homepage";
import ResetPassword from "./pages/pages-ui/ForgotPassword";

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Get all state values first
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);
  const { agencyId } = useSelector((state) => state.integrations || {});
  const account = useCurrentAccount();

  const hasRedirected = useRef(false);
  const isProcessing = useRef(false);
  const previousAuthState = useRef(isAuthenticated);

  // Token verification
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated]);

// 🔥 GHL REDIRECT LOGIC - Now with strict Referrer/Origin checks
useEffect(() => {
  const handleGhlRedirect = async () => {
    const justLoggedIn = !previousAuthState.current && isAuthenticated;
    
    if (justLoggedIn) {
      hasRedirected.current = false;
      isProcessing.current = false;
    }
    
    previousAuthState.current = isAuthenticated;

    if (!isAuthenticated || hasRedirected.current || isProcessing.current) return;

    // 1. Check if we are already in an app session
    if (location.pathname === "/app" || location.pathname.startsWith("/app")) return;

    // 2. STRICT CHECK: Should we even be looking for a GHL redirect?
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    const hasGhlParams = currentUrl.includes("locationId=") || currentUrl.includes("subaccount=");
    const isFromGhl = referrer.includes('gohighlevel.com') || referrer.includes('app.msgsndr.com') || hasGhlParams;

    // If we aren't coming from GHL and don't have GHL params in the URL, stop here.
    if (!isFromGhl) {
      console.log("🏠 Standard web login detected. Skipping GHL redirect.");
      return;
    }

    const pendingId = localStorage.getItem("ghl_pending_locationId");
    if (!pendingId || pendingId.includes("{{")) {
      return;
    }

    console.log("✅ GHL Context detected! Starting redirect...");
    isProcessing.current = true;
    // If you have the setIsRedirecting state from the previous step, set it here:
    // setIsRedirecting(true);

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      const response = await apiClient.get("/integrations/get-subaccounts?userType=anon");
      const subAccountList = response.data?.data?.locations || [];
      
      const match = subAccountList.find(
        (acc) => String(acc.id) === String(pendingId)
      );

      if (match) {
        hasRedirected.current = true;
        const params = new URLSearchParams({
          agencyid: match.companyId || agencyId || "",
          subaccount: match.id,
          allow: "yes",
          myname: encodeURIComponent(match.name || "User"),
          myemail: encodeURIComponent(match.email || ""),
          route: "/assistants",
        });

        localStorage.removeItem("ghl_pending_locationId");
        navigate(`/app?${params.toString()}`, { replace: true });
      } else {
        console.warn("⚠️ No matching subaccount found for ID:", pendingId);
        isProcessing.current = false;
      }
    } catch (error) {
      console.error("❌ GHL redirect error:", error);
      isProcessing.current = false;
    } finally {
      // setIsRedirecting(false);
    }
  };

  handleGhlRedirect();
}, [isAuthenticated, navigate, agencyId, location.pathname]);

  // Define userInfo
  const userInfo = {
    name: account
      ? decodeURIComponent(account.myname)
      : user?.name || defaultUserInfo.name || "Your Agency",
    users: defaultUserInfo.users || "0",
    currentUser: {
      initial:
        user?.name?.charAt(0).toUpperCase() ||
        defaultUserInfo.currentUser?.initial ||
        "U",
      email:
        user?.email || defaultUserInfo.currentUser?.email || "user@example.com",
    },
  };

  const authPaths = [
    "/homepage",
    "/login",
    "/register",
    "/reset-link",
    "/confirm_email_address",
  ];

  const ghlPaths = [
    "/inbox",
    "/call",
    "/contacts",
    "/knowledge",
    "/assistants",
    "/activetags",
    "/numbers",
    "/pools",
    "/widgets",
    "/helps",
    "/ghl_settings",
    "/app",
  ];

  const isAuthPage = authPaths.includes(location.pathname);
  const isGHLPage =
    location.pathname === "/app" ||
    ghlPaths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-gray-50">
      <GHLLocationCapture />
      <Toaster position="top-right" reverseOrder={false} />
      {!isAuthPage &&
        isAuthenticated &&
        (isGHLPage ? (
          <SidebarGHL
            userInfo={userInfo}
            navigationItems={navigationGHLItems}
          />
        ) : (
          <Sidebar userInfo={userInfo} navigationItems={navigationItems} />
        ))}

      {/* Main Area */}
      <div
        className={`flex-1 ${
          !isAuthPage && isAuthenticated ? "" : ""
        } overflow-y-auto`}
      >
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-link" element={<ResetLink />} />
          <Route
            path="/confirm_email_address/:token"
            element={<VerifyEmail />}
          />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/homepage" element={<HomePage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <MainContent />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}