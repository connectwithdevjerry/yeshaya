// src/MainContent.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { Routes, Route, useLocation, useSearchParams, useNavigate } from "react-router-dom";
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

  const { agencyId } = useSelector((state) => state.integrations || {});
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // 🔥 1. UPDATED EXTRACTION: Capture ID from the new GHL Custom Link params
  useEffect(() => {
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    
    // First Priority: Check for the direct 'subaccount' param from your GHL URL
    let detectedId = searchParams.get('subaccount');

    // Second Priority: Fallback to URL Pattern matching if direct param is missing
    if (!detectedId || detectedId.includes('{{')) {
      const ghlPattern = /\/location\/([a-zA-Z0-9_-]{15,30})/;
      const extractId = (url) => (url.match(ghlPattern) || [])[1];
      detectedId = extractId(referrer) || extractId(currentUrl) || searchParams.get('locationId');
    }

    if (detectedId && !detectedId.includes('{{')) {
      console.log('✅ Captured GHL Location ID:', detectedId);
      sessionStorage.setItem('ghl_locationId', detectedId);
      sessionStorage.setItem('ghl_captureTime', Date.now().toString());
    }
  }, [searchParams]);

  // 🔥 2. NAVIGATION EFFECT: Match extracted ID with your DB sub-accounts
  useEffect(() => {
    const handleNavigation = async () => {
      // Safety checks: stop if already redirecting, not logged in, or already on an app route
      if (hasRedirected.current || isProcessing.current || !isAuthenticated) return;
      if (location.pathname !== '/' && location.pathname !== '/app') return;

      const storedLocationId = sessionStorage.getItem('ghl_locationId');
      
      if (storedLocationId) {
        try {
          isProcessing.current = true;
          console.log('🔄 Matching GHL ID against database...');
          
          const result = await dispatch(fetchImportedSubAccounts());
          const apiResponse = result.payload;
          const fetchedSubAccounts = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
          const fetchedAgencyId = apiResponse?.agencyId || null;
          
          // Match the URL ID with one of your fetched sub-accounts
          const matchingAccount = fetchedSubAccounts.find(acc => acc.id === storedLocationId);

          if (matchingAccount) {
            console.log('🎯 Match found. Redirecting to Assistants...');
            hasRedirected.current = true;
            
            const finalAgencyId = matchingAccount.companyId || fetchedAgencyId || companyDetails?.id || agencyId;
            
            // Build the params for your /app route
            const params = new URLSearchParams({
              agencyid: finalAgencyId,
              subaccount: matchingAccount.id,
              allow: "yes",
              myname: searchParams.get("myname") || encodeURIComponent(matchingAccount.name || "User"),
              myemail: searchParams.get("myemail") || encodeURIComponent(matchingAccount.email || ""),
              route: "/assistants", // Force navigation to the assistant view
            });

            sessionStorage.removeItem('ghl_locationId'); // Clear to prevent loops
            navigate(`/app?${params.toString()}`, { replace: true });
          } else {
            console.warn('⚠️ No match found for GHL ID:', storedLocationId);
            isProcessing.current = false;
          }
        } catch (error) {
          console.error('❌ Auto-navigation Error:', error);
          isProcessing.current = false;
        }
      }
    };
    
    handleNavigation();
  }, [location.pathname, searchParams, isAuthenticated, dispatch, navigate, agencyId, companyDetails]);

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
    <div className="flex flex-col flex-1">
      <Header title={getCurrentTitle()} />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<SubAccounts />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/rebilling" element={<Rebilling />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/app" element={<AppRouter />} />
          <Route path="/connection-success/:message" element={<GHLConnectionSuccess />} />
          <Route path="/connection-failed" element={<GHLConnectionFailed />} />
          <Route path="/payment/connection-success" element={<StripeConnectionSuccess />} />
          <Route path="/payment/connection-failed" element={<StripeConnectionFailed />} />
        </Routes>
      </main>
    </div>
  );
}