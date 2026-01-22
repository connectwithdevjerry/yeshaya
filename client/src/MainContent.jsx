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
      console.log("✅ Account stored:", accountData);

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

  const { agencyId } = useSelector((state) => state.integrations || {});
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // 🔥 MAIN FIX: Extract locationId from GoHighLevel URL
  const extractLocationIdFromUrl = () => {
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    
    // Check if current URL or referrer contains GoHighLevel location pattern
    const isGHLUrl = (url) => url.includes('app.gohighlevel.com') && url.includes('/location/');
    
    let locationId = null;
    
    // Try to extract from current URL first
    if (isGHLUrl(currentUrl)) {
      const match = currentUrl.match(/\/location\/([^\/\?&#]+)/);
      if (match) locationId = match[1];
    }
    
    // If not found, try referrer
    if (!locationId && isGHLUrl(referrer)) {
      const match = referrer.match(/\/location\/([^\/\?&#]+)/);
      if (match) locationId = match[1];
    }
    
    // Check URL params as fallback
    if (!locationId) {
      locationId = searchParams.get('locationId') || 
                   searchParams.get('location') || 
                   searchParams.get('subaccount');
    }
    
    return locationId;
  };

  // 1️⃣ Effect: Auto-navigate from GHL Custom Menu Link
  useEffect(() => {
    const handleGHLNavigation = async () => {
      // Prevent multiple redirects
      if (hasRedirected.current || !isAuthenticated) return;
      
      // Only run on root or /app paths
      if (location.pathname !== '/' && location.pathname !== '/app') return;
      
      // Extract locationId from URL
      const locationId = extractLocationIdFromUrl();
      
      console.log('🔍 Detected locationId:', locationId);
      
      // If no locationId detected, skip
      if (!locationId) return;
      
      // If already on correct subaccount, skip
      if (searchParams.get('subaccount') === locationId) return;

      try {
        hasRedirected.current = true;
        console.log('📥 Fetching subaccounts for locationId:', locationId);
        
        const result = await dispatch(fetchImportedSubAccounts());
        
        // ✅ Access the correct structure from your API response
        const fetchedSubAccounts = result.payload?.data || [];
        const fetchedAgencyId = result.payload?.agencyId || null;
        
        console.log('📦 Fetched subaccounts:', fetchedSubAccounts);
        console.log('🏢 Agency ID:', fetchedAgencyId);
        
        // Find matching account by locationId
        const matchingAccount = fetchedSubAccounts.find(acc => acc.id === locationId);
        
        if (!matchingAccount) {
          console.warn('❌ No matching subaccount found for locationId:', locationId);
          hasRedirected.current = false;
          return;
        }
        
        console.log('✅ Found matching account:', matchingAccount);

        // Determine target route
        let targetRoute = "/assistants";
        if (location.pathname === "/app") {
          targetRoute = searchParams.get("route") || "/assistants";
        } else if (["/inbox", "/call", "/contacts", "/knowledge", "/assistants", "/activetags", "/numbers", "/pools", "/widgets", "/helps", "/ghl_settings"].includes(location.pathname)) {
          targetRoute = location.pathname;
        }

        // Use companyId from matched account, fallback to fetched agencyId
        const finalAgencyId = matchingAccount.companyId || fetchedAgencyId || companyDetails?.id || agencyId || "UNKNOWN_COMPANY";
        
        // Build navigation params
        const params = new URLSearchParams({
          agencyid: finalAgencyId,
          subaccount: matchingAccount.id,
          allow: "yes",
          myname: encodeURIComponent(matchingAccount.name || "NoName"),
          myemail: encodeURIComponent(matchingAccount.email || "noemail@example.com"),
          route: targetRoute,
        });

        console.log('🚀 Navigating with params:', params.toString());

        // Navigate to /app with proper parameters
        setTimeout(() => {
          navigate(`/app?${params.toString()}`, { replace: true });
        }, 0);
        
      } catch (error) {
        console.error('❌ Navigation Error:', error);
        hasRedirected.current = false;
      }
    };
    
    handleGHLNavigation();
  }, [location.pathname, isAuthenticated, dispatch, navigate, searchParams, agencyId, companyDetails]);

  // 2️⃣ Effect: Handle basic GHL context redirect (fallback)
  useEffect(() => {
    if (hasRedirected.current) return;

    const subaccount = searchParams.get("subaccount");
    const agencyid = searchParams.get("agencyid");
    const isGHLReferrer = document.referrer.includes("app.gohighlevel.com");
    
    if (location.pathname === "/" && ((subaccount && agencyid) || isGHLReferrer)) {
      hasRedirected.current = true;
      console.log("🚀 Basic GHL context redirecting...");

      const params = new URLSearchParams(searchParams);
      if (!params.get("route")) params.set("route", "/assistants");
      if (!params.has("allow")) params.set("allow", "yes");

      navigate(`/app?${params.toString()}`, { replace: true });
    }
  }, [location.pathname, searchParams, navigate]);

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