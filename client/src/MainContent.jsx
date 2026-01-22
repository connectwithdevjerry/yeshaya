// src/MainContent.jsx
import React, { useEffect, useMemo } from "react";
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

// ✅ Component to render based on route parameterss
const AppRouter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const route = searchParams.get("route") || "/assistants";

  // Store account data in sessionStorage
  useEffect(() => {
    const agencyid = searchParams.get("agencyid");
    const subaccount = searchParams.get("subaccount");
    const allow = searchParams.get("allow");
    const myname = searchParams.get("myname");
    const myemail = searchParams.get("myemail");

    if (agencyid && subaccount) {
      const accountData = {
        agencyid,
        subaccount,
        allow,
        myname,
        myemail,
      };
      sessionStorage.setItem("currentAccount", JSON.stringify(accountData));
      console.log("✅ Account stored:", accountData);

      if (!searchParams.get("route")) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("route", "/assistants");
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // Route mapping
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

  if (route.startsWith("/assistants/")) {
    return <AssistantBuilderPage />;
  }

  if (route.startsWith("/knowledge/")) {
    return <KnowledgeDetailPage />;
  }

  return routeComponents[route] || <Assistants />;
};

export default function MainContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Get subAccounts and agencyId from Redux store
  const { subAccounts, agencyId } = useSelector(
    (state) => state.integrations || {}
  );
  const { companyDetails } = useSelector((state) => state.auth || {});

  // New useEffect: Auto-navigate from GHL Custom Menu Link in URL or referrer
  useEffect(() => {
    const handleGHLUrlNavigation = async () => {
      // Only run on root path or /app when no subaccount params exist
      if (location.pathname !== '/' && location.pathname !== '/app') return;
      
      // Check if current URL or referrer contains GHL custom menu link pattern
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      
      // Check both current URL and referrer for GHL custom menu link
      const urlToCheck = currentUrl.includes('app.gohighlevel.com') && 
                         currentUrl.includes('/location/') && 
                         currentUrl.includes('/custom-menu-link/') 
                         ? currentUrl 
                         : (referrer.includes('app.gohighlevel.com') && 
                            referrer.includes('/location/') && 
                            referrer.includes('/custom-menu-link/')
                            ? referrer 
                            : null);
      
      if (!urlToCheck) {
        return;
      }
      
      console.log('🔗 Detected GHL custom menu link:', urlToCheck);
      
      // Extract location ID from URL
      // Format: https://app.gohighlevel.com/v2/location/{LOCATION_ID}/custom-menu-link/{LINK_ID}
      const locationMatch = urlToCheck.match(/\/location\/([^\/]+)\//);
      if (!locationMatch) {
        console.log('❌ Could not extract location ID from URL');
        return;
      }
      
      const locationId = locationMatch[1];
      console.log('🔍 Extracted GHL location ID:', locationId);
      
      // Check if we already have this subaccount in params (avoid infinite loop)
      const existingSubaccount = searchParams.get('subaccount');
      if (existingSubaccount === locationId) {
        console.log('ℹ️ Already navigated to this subaccount');
        return;
      }
      
      // Fetch subaccounts if not already loaded
      if (!subAccounts || subAccounts.length === 0) {
        console.log('📥 Fetching subaccounts...');
        await dispatch(fetchImportedSubAccounts());
      }
      
      setTimeout(() => {
        // Re-read from selector after dispatch
        const store = dispatch((_, getState) => getState());
        const currentSubAccounts = store.integrations?.subAccounts || subAccounts;
        
        if (!currentSubAccounts || currentSubAccounts.length === 0) {
          console.log('❌ No subaccounts available');
          return;
        }
        
        // Find matching subaccount by location ID
        const matchingAccount = currentSubAccounts.find(
          acc => acc.id === locationId
        );
        
        if (!matchingAccount) {
          console.log('❌ No matching subaccount found for location:', locationId);
          console.log('📋 Available subaccounts:', currentSubAccounts.map(a => a.id));
          return;
        }
        
        console.log('✅ Found matching account:', matchingAccount.name);
        
        // Build navigation URL with all required params (same as UserProfile)
        const params = new URLSearchParams({
          agencyid: companyDetails?.id || companyDetails?.companyId || agencyId || 'UNKNOWN_COMPANY',
          subaccount: matchingAccount.id,
          allow: 'yes',
          myname: matchingAccount.name || matchingAccount.companyName || 'NoName',
          myemail: matchingAccount.email || 'noemail@example.com',
          route: '/assistants'
        });
        
        const targetUrl = `/app?${params.toString()}`;
        console.log('🚀 Auto-navigating to:', targetUrl);
        
        // Navigate to assistants page
        navigate(targetUrl, { replace: true });
        
      }, 500);
    };
    
    handleGHLUrlNavigation();
  }, [location.pathname, subAccounts, agencyId, companyDetails, dispatch, navigate, searchParams]);

  // First useEffect: Handle basic GHL context redirect
  useEffect(() => {
    const subaccount = searchParams.get("subaccount");
    const agencyid = searchParams.get("agencyid");
    
    const isGHLReferrer = document.referrer.includes("app.gohighlevel.com");
    const hasGHLParams = subaccount && agencyid;

    // Only redirect if we have params or GHL referrer, but NOT if it's a custom menu link
    const isCustomMenuLink = document.referrer.includes('/custom-menu-link/');
    
    if (location.pathname === "/" && (hasGHLParams || isGHLReferrer) && !isCustomMenuLink) {
      console.log("🚀 GHL context detected. Redirecting to Assistants context...");

      const params = new URLSearchParams(searchParams);

      if (!params.get("route")) {
        params.set("route", "/assistants");
      }

      if (!params.has("allow")) {
        params.set("allow", "yes");
      }

      navigate(`/app?${params.toString()}`, { replace: true });
    }
  }, [location.pathname, searchParams, navigate]);

  // Second useEffect: Auto-navigation from GHL Custom Menu Link
  useEffect(() => {
    const handleGHLCustomMenuLink = async () => {
      if (location.pathname !== '/') return;
      
      const referrer = document.referrer;
      const isGHLCustomMenuLink = referrer.includes('app.gohighlevel.com') && referrer.includes('/custom-menu-link/');
      
      if (!isGHLCustomMenuLink) {
        console.log('ℹ️ Not from GHL custom menu link');
        return;
      }
      
      console.log('🔗 Detected GHL custom menu link referrer:', referrer);
      
      // Format: https://app.gohighlevel.com/v2/location/{LOCATION_ID}/custom-menu-link/{LINK_ID}
      const locationMatch = referrer.match(/\/location\/([^\/]+)\//);
      if (!locationMatch) {
        console.log('❌ Could not extract location ID from referrer');
        return;
      }
      
      const locationId = locationMatch[1];
      console.log('🔍 Extracted GHL location ID:', locationId);
      
      // Fetch subaccounts if not already loaded
      if (!subAccounts || subAccounts.length === 0) {
        console.log('📥 Fetching subaccounts...');
        await dispatch(fetchImportedSubAccounts());
      }
      
      setTimeout(() => {
        // Re-read from selector after dispatch
        const store = dispatch((_, getState) => getState());
        const currentSubAccounts = store.integrations?.subAccounts || subAccounts;
        
        if (!currentSubAccounts || currentSubAccounts.length === 0) {
          console.log('❌ No subaccounts available');
          return;
        }
        
        // Find matching subaccount by location ID
        const matchingAccount = currentSubAccounts.find(
          acc => acc.id === locationId
        );
        
        if (!matchingAccount) {
          console.log('❌ No matching subaccount found for location:', locationId);
          console.log('📋 Available subaccounts:', currentSubAccounts.map(a => a.id));
          return;
        }
        
        console.log('✅ Found matching account:', matchingAccount.name);
        
        // Build navigation URL with all required params
        const params = new URLSearchParams({
          agencyid: agencyId || matchingAccount.companyId || 'UNKNOWN_COMPANY',
          subaccount: matchingAccount.id,
          allow: 'yes',
          myname: encodeURIComponent(matchingAccount.name || 'NoName'),
          myemail: encodeURIComponent(matchingAccount.email || 'noemail@example.com'),
          route: '/assistants'
        });
        
        const targetUrl = `/app?${params.toString()}`;
        console.log('🚀 Auto-navigating to:', targetUrl);
        
        // Navigate to assistants page
        navigate(targetUrl, { replace: true });
        
      }, 500);
    };
    
    handleGHLCustomMenuLink();
  }, [location.pathname, subAccounts, agencyId, dispatch, navigate]);

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
    []
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

  const currentTitle = getCurrentTitle();

  return (
    <div className="flex flex-col flex-1">
      <Header title={currentTitle} />
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