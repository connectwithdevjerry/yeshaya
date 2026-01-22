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
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // New useEffect: Auto-navigate from GHL Custom Menu Link in URL or referrer
  // This should run FIRST to handle custom menu links before basic GHL redirect
  // Runs immediately after login (isAuthenticated becomes true)
  useEffect(() => {
    const handleGHLUrlNavigation = async () => {
      // Only run when authenticated
      if (!isAuthenticated) {
        console.log('⏳ Waiting for authentication...');
        return;
      }
      
      // Only run on root path or /app when no subaccount params exist
      if (location.pathname !== '/' && location.pathname !== '/app') return;
      
      // Check if current URL or referrer contains GHL custom menu link pattern
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      
      console.log('🔍 Checking for GHL custom menu link...');
      console.log('📍 Current URL:', currentUrl);
      console.log('📍 Referrer:', referrer || '(empty)');
      console.log('📍 Search Params:', Object.fromEntries(searchParams.entries()));
      
      // Check both current URL and referrer for GHL custom menu link
      const isCurrentUrlGHL = currentUrl.includes('app.gohighlevel.com') && 
                                currentUrl.includes('/location/') && 
                                currentUrl.includes('/custom-menu-link/');
      
      const isReferrerGHL = referrer && referrer.includes('app.gohighlevel.com') && 
                            referrer.includes('/location/') && 
                            referrer.includes('/custom-menu-link/');
      
      // Also check if referrer contains location pattern (even without custom-menu-link)
      const referrerHasLocation = referrer && referrer.includes('app.gohighlevel.com') && 
                                  referrer.includes('/location/');
      
      // Check for location ID in query parameters as fallback
      const locationIdFromParams = searchParams.get('locationId') || 
                                   searchParams.get('location') || 
                                   searchParams.get('subaccount');
      
      let urlToCheck = isCurrentUrlGHL ? currentUrl : (isReferrerGHL ? referrer : null);
      let locationId = null;
      
      // If we have a direct custom menu link URL, extract location ID from it
      if (urlToCheck) {
        console.log('🔗 Detected GHL custom menu link:', urlToCheck);
        const locationMatch = urlToCheck.match(/\/location\/([^\/]+)\//);
        if (locationMatch) {
          locationId = locationMatch[1];
          console.log('🔍 Extracted GHL location ID from URL:', locationId);
        }
      }
      // If referrer has location pattern but not custom-menu-link, try to extract location ID
      else if (referrerHasLocation) {
        console.log('🔗 Detected GHL referrer with location pattern:', referrer);
        const locationMatch = referrer.match(/\/location\/([^\/]+)/);
        if (locationMatch) {
          locationId = locationMatch[1];
          console.log('🔍 Extracted GHL location ID from referrer:', locationId);
        }
      }
      // Check if location ID is in query parameters
      else if (locationIdFromParams) {
        locationId = locationIdFromParams;
        console.log('🔍 Found location ID in query parameters:', locationId);
      }
      // If coming from GHL but no location ID found, return early
      else {
        const isGHLReferrer = referrer && referrer.includes('app.gohighlevel.com');
        if (!isGHLReferrer) {
          console.log('ℹ️ Not from GHL - skipping custom menu link detection');
          return;
        }
        console.log('ℹ️ Coming from GHL but no location ID found in URL, referrer, or params');
        console.log('   Current URL check:', {
          hasGHL: currentUrl.includes('app.gohighlevel.com'),
          hasLocation: currentUrl.includes('/location/'),
          hasCustomMenu: currentUrl.includes('/custom-menu-link/')
        });
        console.log('   Referrer check:', {
          hasReferrer: !!referrer,
          hasGHL: referrer ? referrer.includes('app.gohighlevel.com') : false,
          hasLocation: referrer ? referrer.includes('/location/') : false,
          hasCustomMenu: referrer ? referrer.includes('/custom-menu-link/') : false,
          fullReferrer: referrer
        });
        return;
      }
      
      if (!locationId) {
        console.log('❌ Could not extract location ID from any source');
        return;
      }
      
      // Check if we already have this subaccount in params (avoid infinite loop)
      const existingSubaccount = searchParams.get('subaccount');
      if (existingSubaccount === locationId) {
        console.log('ℹ️ Already navigated to this subaccount');
        return;
      }
      
      try {
        // Always fetch subaccounts using fetchImportedSubAccounts to get the latest data
        console.log('📥 Fetching subaccounts using fetchImportedSubAccounts...');
        const result = await dispatch(fetchImportedSubAccounts());
        
        // Extract subaccounts and agencyId from the fetch result
        // fetchImportedSubAccounts returns { locations, agencyId }
        const fetchedSubAccounts = result.payload?.locations || [];
        const fetchedAgencyId = result.payload?.agencyId || null;
        
        if (!fetchedSubAccounts || fetchedSubAccounts.length === 0) {
          console.log('❌ No subaccounts available after fetch');
          return;
        }
        
        console.log('📋 Fetched subaccounts:', fetchedSubAccounts.length);
        console.log('📋 Available subaccount IDs:', fetchedSubAccounts.map(a => a.id));
        
        // Find matching subaccount by location ID (the id field matches the locationId from URL)
        const matchingAccount = fetchedSubAccounts.find(
          acc => acc.id === locationId
        );
        
        if (!matchingAccount) {
          console.log('❌ No matching subaccount found for location:', locationId);
          console.log('📋 Available subaccount IDs:', fetchedSubAccounts.map(a => a.id));
          return;
        }
        
        console.log('✅ Found matching account:', matchingAccount.name);
        console.log('📦 Account data:', {
          id: matchingAccount.id,
          companyId: matchingAccount.companyId,
          name: matchingAccount.name,
          email: matchingAccount.email,
          firstName: matchingAccount.firstName,
          lastName: matchingAccount.lastName
        });
        console.log('📦 Available agency IDs:', {
          fromAccount: matchingAccount.companyId,
          fromFetch: fetchedAgencyId,
          fromRedux: agencyId,
          fromCompanyDetails: companyDetails?.id || companyDetails?.companyId
        });
        
        // Determine target route (same logic as AccountActionsMenu)
        let targetRoute = "/assistants";
        
        if (location.pathname === "/app") {
          targetRoute = searchParams.get("route") || "/assistants";
        } else if (
          [
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
            "/blog",
          ].includes(location.pathname)
        ) {
          targetRoute = location.pathname;
        }
        
        // Determine agencyid - prioritize in order: account.companyId > fetchedAgencyId > companyDetails > Redux agencyId
        const finalAgencyId = matchingAccount.companyId || 
                              fetchedAgencyId || 
                              companyDetails?.id || 
                              companyDetails?.companyId || 
                              agencyId || 
                              "UNKNOWN_COMPANY";
        
        console.log('🏢 Final agency ID selected:', finalAgencyId);
        
        // Build navigation URL using all required parameters from the fetched subaccount data
        // Using same parameter structure as AccountActionsMenu
        const params = new URLSearchParams({
          agencyid: finalAgencyId,
          subaccount: matchingAccount.id || "NO_ID",
          allow: "yes",
          myname: matchingAccount.name || "NoName",
          myemail: matchingAccount.email || "noemail@example.com",
          route: targetRoute, // ✅ Include the route as a parameter
        });
        
        const targetUrl = `/app?${params.toString()}`;
        console.log('🚀 Auto-navigating to:', targetUrl);
        console.log('📋 Navigation params:', {
          agencyid: params.get('agencyid'),
          subaccount: params.get('subaccount'),
          myname: params.get('myname'),
          myemail: params.get('myemail'),
          route: params.get('route')
        });
        
        // Navigate to assistants page (using setTimeout like AccountActionsMenu for consistency)
        setTimeout(() => {
          navigate(targetUrl, { replace: true });
        }, 0);
        
      } catch (error) {
        console.error('❌ Error fetching or navigating to subaccount:', error);
      }
    };
    
    handleGHLUrlNavigation();
  }, [location.pathname, agencyId, isAuthenticated, dispatch, navigate, searchParams]);

  // Second useEffect: Handle basic GHL context redirect (runs after custom menu link check)
  useEffect(() => {
    const subaccount = searchParams.get("subaccount");
    const agencyid = searchParams.get("agencyid");
    
    const isGHLReferrer = document.referrer.includes("app.gohighlevel.com");
    const hasGHLParams = subaccount && agencyid;

    // Only redirect if we have params or GHL referrer, but NOT if it's a custom menu link
    // Check both current URL and referrer for custom menu link pattern
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    const isCustomMenuLink = (currentUrl.includes('/custom-menu-link/') && currentUrl.includes('/location/')) ||
                            (referrer.includes('/custom-menu-link/') && referrer.includes('/location/'));
    
    // Skip basic redirect if custom menu link is detected (let the first useEffect handle it)
    if (isCustomMenuLink) {
      console.log("ℹ️ Custom menu link detected, skipping basic GHL redirect");
      return;
    }
    
    if (location.pathname === "/" && (hasGHLParams || isGHLReferrer)) {
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