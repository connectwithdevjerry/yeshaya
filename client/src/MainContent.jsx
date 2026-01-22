// src/MainContent.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useLocation, useSearchParams, useNavigate, Navigate } from "react-router-dom";
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
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // 🔥 1. IMMEDIATE CAPTURE: Store in localStorage to survive login redirects
  useEffect(() => {
    let detectedId = searchParams.get('subaccount') || searchParams.get('locationId');

    if (!detectedId || detectedId.includes('{{')) {
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      const ghlPattern = /\/location\/([a-zA-Z0-9_-]{15,30})/;
      const extractId = (url) => (url.match(ghlPattern) || [])[1];
      detectedId = extractId(referrer) || extractId(currentUrl);
    }

    if (detectedId && !detectedId.includes('{{')) {
      console.log('✅ Captured GHL Location ID:', detectedId);
      localStorage.setItem('ghl_pending_locationId', detectedId);
    }
  }, [searchParams]);


// 🔥 2. AUTO-NAVIGATION: Runs once user IS authenticated
useEffect(() => {
  const handleGhlNavigation = async () => {
    // 1. Check if we should even attempt navigation
    const pendingId = localStorage.getItem('ghl_pending_locationId');
    if (!isAuthenticated || !pendingId || hasRedirected.current) return;
    
    // 2. Prevent concurrent API calls, but allow retry if previous attempt was empty
    if (isProcessing.current) return;

    try {
      isProcessing.current = true;
      setIsNavigatingToGhl(true);
      console.log('🔄 Authenticated. Matching GHL ID:', pendingId);
      
      const result = await dispatch(fetchImportedSubAccounts());
      const apiResponse = result.payload;
      const fetchedSubAccounts = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
      
      console.log(`📊 Check: Found ${fetchedSubAccounts.length} accounts in DB.`);

      if (fetchedSubAccounts.length === 0) {
        console.log("⏳ Subaccounts list empty, releasing lock for retry...");
        isProcessing.current = false; // RELEASE THE LOCK
        setIsNavigatingToGhl(false);
        return; // Exit and wait for the next render/dependency trigger
      }

      const match = fetchedSubAccounts.find(acc => acc.id === pendingId);

      if (match) {
        console.log('🎯 Match found! Redirecting to Assistant Page...');
        hasRedirected.current = true;
        
        const finalAgencyId = apiResponse?.agencyId || match.companyId || companyDetails?.id || agencyId;
        
        const params = new URLSearchParams({
          agencyid: finalAgencyId,
          subaccount: match.id,
          allow: "yes",
          myname: encodeURIComponent(match.name || "User"),
          myemail: encodeURIComponent(match.email || ""),
          route: "/assistants",
        });

        localStorage.removeItem('ghl_pending_locationId'); 
        navigate(`/app?${params.toString()}`, { replace: true });
      } else {
        console.warn('⚠️ GHL ID not found in matched accounts. Clearing pending ID.');
        localStorage.removeItem('ghl_pending_locationId');
        setIsNavigatingToGhl(false);
        isProcessing.current = false;
      }
    } catch (error) {
      console.error('❌ GHL Sync Error:', error);
      isProcessing.current = false;
      setIsNavigatingToGhl(false);
    }
  };
  
  handleGhlNavigation();
  
  // We add 'location.pathname' so that if they are on the dashboard, it keeps trying 
  // until the subaccounts are actually loaded into the state.
}, [isAuthenticated, dispatch, navigate, agencyId, companyDetails, location.pathname]);

  const pageTitles = useMemo(() => ({
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
  }), []);

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
            element={!isAuthenticated ? <Navigate to="/login" replace /> : <AppRouter />} 
          />

          <Route path="/connection-success/:message" element={<GHLConnectionSuccess />} />
          <Route path="/connection-failed" element={<GHLConnectionFailed />} />
          <Route path="/payment/connection-success" element={<StripeConnectionSuccess />} />
          <Route path="/payment/connection-failed" element={<StripeConnectionFailed />} />
        </Routes>
      </main>
    </div>
  );
}