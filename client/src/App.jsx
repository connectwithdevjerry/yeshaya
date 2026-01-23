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
import { fetchImportedSubAccounts } from "./store/slices/integrationSlice";
import { useCurrentAccount } from "./hooks/useCurrentAccount";
import { Toaster } from "react-hot-toast";
import { GHLLocationCapture } from "./GHLLocationCapture.jsx";

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
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);
  const { agencyId } = useSelector((state) => state.integrations || {});
  const account = useCurrentAccount();

  const hasRedirected = useRef(false);
  const isProcessing = useRef(false);

  // Token verification
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated]);

  // 🔥 GHL REDIRECT LOGIC - Runs immediately after login
  useEffect(() => {
    const handleGhlRedirect = async () => {
      // Skip if not authenticated or already redirected
      if (!isAuthenticated || hasRedirected.current || isProcessing.current) {
        return;
      }

      // Skip if already on a GHL page
      if (location.pathname === "/app" || location.pathname.startsWith("/app")) {
        return;
      }

      const pendingId = localStorage.getItem("ghl_pending_locationId");
      if (!pendingId || pendingId.includes("{{")) {
        return;
      }

      isProcessing.current = true;

      try {
        console.log("🔄 Checking GHL location match:", pendingId);

        const result = await dispatch(fetchImportedSubAccounts());
        const subAccountList = Array.isArray(result.payload?.data)
          ? result.payload.data
          : [];

        const match = subAccountList.find(
          (acc) => String(acc.id) === String(pendingId)
        );

        if (match) {
          console.log("🎯 GHL Match found! Redirecting to /app...");
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
          console.warn("⚠️ No matching GHL location found");
          isProcessing.current = false;
        }
      } catch (error) {
        console.error("❌ GHL redirect error:", error);
        isProcessing.current = false;
      }
    };

    handleGhlRedirect();
  }, [isAuthenticated, dispatch, navigate, agencyId, location.pathname]);

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