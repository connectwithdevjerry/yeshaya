// src/MainContent.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useSearchParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/components-ui/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchImportedSubAccounts } from "./store/slices/integrationSlice";

// ---- Pages from Agency section ----
import Agency from "./pages/pages-ui/Agency";
import Integrations from "./pages/pages-ui/Integrations";
import Rebilling from "./pages/pages-ui/Rebilling";
import Settings from "./pages/pages-ui/Settings";
import SubAccounts from "./pages/pages-ui/SubAccounts";
import DashboardPage from "./pages/pages-ui/Dashboard";

// ---- Integration Status Pages ----
import GHLConnectionSuccess from "./pages/pages-ui/Integrationstatus/GHL/Sucess";
import GHLConnectionFailed from "./pages/pages-ui/Integrationstatus/GHL/Failure";
import StripeConnectionSuccess from "./pages/pages-ui/Integrationstatus/Stripe/Success";
import StripeConnectionFailed from "./pages/pages-ui/Integrationstatus/Stripe/Failure";

// ---- Communication/CRM Pages ----
import Inbox from "./pages/pages-ghl/Inbox";
import CallCenter from "./pages/pages-ghl/CallCenter";
import Contacts from "./pages/pages-ghl/Contacts";
import Knowledge from "./pages/pages-ghl/Knowledge";
import Assistants from "./pages/pages-ghl/Assistants";
import Tags from "./pages/pages-ghl/Tags";
import Numbers from "./pages/pages-ghl/Number/Numbers";
import { NumberPool } from "./pages/pages-ghl/Number/Pools";
import Widgets from "./pages/pages-ghl/Widgets";
import Helps from "./pages/pages-ghl/Helps";
import GHLSettings from "./pages/pages-ghl/Settings";
import { AssistantBuilderPage } from "./components/components-ghl/AssistantsBuilder/AssistantsBuilder";
import KnowledgeDetailPage from "./components/components-ghl/Knowledge/BlogEdit";

// ✅ Component to render based on route parameters
const AppRouter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const route = searchParams.get("route") || "/assistants";

  useEffect(() => {
    const agencyid = searchParams.get("agencyid");
    const subaccount = searchParams.get("subaccount");
    const allow = searchParams.get("allow");
    const myname = searchParams.get("myname");
    const myemail = searchParams.get("myemail");

    if (agencyid && subaccount) {
      const accountData = { agencyid, subaccount, allow, myname, myemail };
      sessionStorage.setItem("currentAccount", JSON.stringify(accountData));

      if (!searchParams.get("route")) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("route", "/assistants");
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  const routeComponents = {
    "/assistants": <Assistants />,
    "/inbox": <Inbox />,
    "/call": <CallCenter />,
    "/contacts": <Contacts />,
    "/knowledge": <Knowledge />,
    "/activetags": <Tags />,
    "/numbers": <Numbers />,
    "/pools": <NumberPool />,
    "/widgets": <Widgets />,
    "/helps": <Helps />,
    "/ghl_settings": <GHLSettings />,
    "/agency": <Agency />,
    "/dashboard": <DashboardPage />,
  };

  if (route.startsWith("/assistants/")) return <AssistantBuilderPage />;
  if (route.startsWith("/knowledge/")) return <KnowledgeDetailPage />;

  return routeComponents[route] || <Assistants />;
};

export default function MainContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const hasRedirected = useRef(false);
  const isProcessing = useRef(false);
  const [isNavigatingToGhl, setIsNavigatingToGhl] = useState(false);

  const { agencyId } = useSelector((state) => state.integrations || {});
  const { companyDetails, isAuthenticated } = useSelector(
    (state) => state.auth || {},
  );

  // 🔥 1. IMMEDIATE CAPTURE: Store in localStorage to survive login redirects
  useEffect(() => {
    let detectedId =
      searchParams.get("subaccount") || searchParams.get("locationId");

    if (!detectedId || detectedId.includes("{{")) {
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      const ghlPattern = /\/location\/([a-zA-Z0-9_-]{15,30})/;
      const extractId = (url) => (url.match(ghlPattern) || [])[1];
      detectedId = extractId(referrer) || extractId(currentUrl);
    }

    if (detectedId && !detectedId.includes("{{")) {
      console.log("✅ Captured GHL Location ID:", detectedId);
      localStorage.setItem("ghl_pending_locationId", detectedId);
    }
  }, [searchParams]);

// 🔥 2. AUTO-NAVIGATION: Updated to trigger immediately after login
useEffect(() => {
  const handleGhlNavigation = async () => {
    const pendingId = localStorage.getItem('ghl_pending_locationId');
    
    // EXIT CONDITIONS
    if (!isAuthenticated || !pendingId || hasRedirected.current) return;
    
    // If we are already in the app with parameters, don't re-run
    if (searchParams.get("subaccount")) {
        localStorage.removeItem('ghl_pending_locationId');
        return;
    }

    // Prevent double-execution
    if (isProcessing.current) return;

    try {
      isProcessing.current = true;
      setIsNavigatingToGhl(true);
      
      console.log('🔄 Login Detected. Matching GHL ID:', pendingId);

      // --- ATTEMPT 1 ---
      const result = await dispatch(fetchImportedSubAccounts());
      let subAccountList = Array.isArray(result.payload?.data) ? result.payload.data : [];

      // --- THE "WAIT" LOGIC ---
      // If 0 accounts, wait 3.5 seconds and try again (Handles the DB buffering)
      if (subAccountList.length === 0) {
        console.warn("⏳ List empty. Waiting 3.5s for backend sync...");
        await new Promise(resolve => setTimeout(resolve, 3500)); 
        
        const retryResult = await dispatch(fetchImportedSubAccounts());
        subAccountList = Array.isArray(retryResult.payload?.data) ? retryResult.payload.data : [];
      }

      console.log(`📊 Final Check: Found ${subAccountList.length} accounts.`);

      const match = subAccountList.find(acc => String(acc.id) === String(pendingId));

      if (match) {
        console.log('🎯 Match found! Navigating to Assistant Page...');
        hasRedirected.current = true;
        
        const finalAgencyId = result.payload?.agencyId || match.companyId || agencyId;
        
        const params = new URLSearchParams({
          agencyid: finalAgencyId,
          subaccount: match.id,
          allow: "yes",
          myname: encodeURIComponent(match.name || "User"),
          myemail: encodeURIComponent(match.email || ""),
          route: "/assistants",
        });

        // CLEAR STORAGE BEFORE NAVIGATING
        localStorage.removeItem('ghl_pending_locationId');
        setIsNavigatingToGhl(false);
        
        // Use replace: true to prevent "back" button loops
        navigate(`/app?${params.toString()}`, { replace: true });
      } else {
        // If we found accounts but none match, stop processing but don't clear 
        // until we are sure it's not a slow DB update.
        console.warn('⚠️ No match found in current list.');
        setIsNavigatingToGhl(false);
        isProcessing.current = false; 
      }
    } catch (error) {
      console.error('❌ GHL Navigation Error:', error);
      setIsNavigatingToGhl(false);
      isProcessing.current = false;
    }
  };

  handleGhlNavigation();

  // Added 'isAuthenticated' and 'location' to ensure this fires 
  // the moment the user lands on the dashboard after login.
}, [isAuthenticated, location.pathname, dispatch, navigate, agencyId, searchParams]);

  const pageTitles = useMemo(
    () => ({
      "/": "Accounts",
      "/agency": "Agency",
      "/integrations": "Integrations",
      "/rebilling": "Rebilling",
      "/settings": "Settings",
      "/dashboard": "Dashboard",
      "/inbox": "Inbox",
      "/call": "Call Center",
      "/contacts": "Contacts",
      "/knowledge": "Knowledge",
      "/assistants": "Assistants",
      "/blog": "Knowledge",
      "/activetags": "Active Tags",
      "/numbers": "Numbers",
      "/pools": "Number Pools",
      "/widgets": "Widgets",
      "/helps": "Help Center",
      "/ghl_settings": "Settings",
      "/connection-success": "Integration Success",
      "/connection-failed": "Integration Failed",
      "/payment/connection-success": "Payment Success",
      "/payment/connection-failed": "Payment Failed",
    }),
    [],
  );

  const getCurrentTitle = () => {
    if (location.pathname === "/app") {
      const route = searchParams.get("route") || "/assistants";
      if (route.startsWith("/assistants/")) return "Assistant Builder";
      if (route.startsWith("/knowledge/")) return "Knowledge";
      return pageTitles[route] || "Dashboard";
    }
    return pageTitles[location.pathname] || "Dashboard";
  };

  return (
    <div className="flex flex-col flex-1 relative">
      {/* 🚀 Loading Overlay for GHL Auto-Navigation */}
      {isNavigatingToGhl && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-blue-800 font-semibold animate-pulse">
            Connecting to your GHL Assistant...
          </p>
        </div>
      )}

      <Header title={getCurrentTitle()} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<SubAccounts />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/rebilling" element={<Rebilling />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route
            path="/app"
            element={
              !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : (
                <AppRouter />
              )
            }
          />

          <Route
            path="/connection-success/:message"
            element={<GHLConnectionSuccess />}
          />
          <Route path="/connection-failed" element={<GHLConnectionFailed />} />
          <Route
            path="/payment/connection-success"
            element={<StripeConnectionSuccess />}
          />
          <Route
            path="/payment/connection-failed"
            element={<StripeConnectionFailed />}
          />
        </Routes>
      </main>
    </div>
  );
}
