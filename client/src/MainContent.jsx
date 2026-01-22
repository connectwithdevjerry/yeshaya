// 🔥 CAPTURE locationId EARLY - before any navigation
  useEffect(() => {
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    
    console.log('🔍 Early Capture Check');
    console.log('  - Current URL:', currentUrl);
    console.log('  - Referrer:', referrer);
    console.log('  - All search params:', Object.fromEntries(searchParams.entries()));
    
    // 🔥 NEW: Try to extract from Performance API (recent navigation)
    try {
      const perfEntries = performance.getEntriesByType('navigation');
      const resourceEntries = performance.getEntriesByType('resource');
      
      console.log('  - Performance navigation entries:', perfEntries.length);
      console.log('  - Performance resource entries:', resourceEntries.length);
      
      // Check recent resource loads for GHL URLs
      const ghlResources = resourceEntries.filter(entry => 
        entry.name.includes('gohighlevel.com') && entry.name.includes('/location/')
      );
      
      if (ghlResources.length > 0) {
        console.log('  - Found GHL resources:', ghlResources);
        for (const resource of ghlResources) {
          const match = resource.name.match(/\/location\/([a-zA-Z0-9_-]{15,25})/);
          if (match) {
            const locationId = match[1];
            console.log('✅ Captured locationId from Performance API:', locationId);
            sessionStorage.setItem('ghl_locationId', locationId);
            sessionStorage.setItem('ghl_captureTime', Date.now().toString());
            return; // Exit early if found
          }
        }
      }
    } catch (perfError) {
      console.log('  - Performance API not available:', perfError.message);
    }
    
    // Check if we're coming from GHL custom menu link
    if (referrer.includes('app.gohighlevel.com') || currentUrl.includes('gohighlevel')) {
      
      // Try to extract locationId from referrer or current URL
      const extractLocationId = (url) => {
        console.log('  - Trying to extract from:', url);
        const patterns = [
          /\/location\/([a-zA-Z0-9_-]{15,25})/, // Standard: /location/ID
          /\/v2\/location\/([a-zA-Z0-9_-]{15,25})/, // V2: /v2/location/ID
          /locationId=([a-zA-Z0-9_-]{15,25})/, // Query: ?locationId=ID
          /location=([a-zA-Z0-9_-]{15,25})/, // Query: ?location=ID
          /subaccount=([a-zA-Z0-9_-]{15,25})/, // Query: ?subaccount=ID
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            console.log('  - ✅ Match found with pattern:', pattern);
            return match[1];
          }
        }
        return null;
      };
      
      let locationId = extractLocationId(referrer) || extractLocationId(currentUrl);
      
      // Also check URL params
      if (!locationId) {
        locationId = searchParams.get('locationId') || 
                     searchParams.get('location') || 
                     searchParams.get('subaccount');
        if (locationId) console.log('  - ✅ Found in URL params:', locationId);
      }
      
      if (locationId) {
        console.log('✅ Captured locationId:', locationId);
        sessionStorage.setItem('ghl_locationId', locationId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
      } else {
        console.log('❌ Could not extract locationId from any source');
      }
    }
  }, []); // Run once on mount// src/MainContent.jsx
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
  const isProcessing = useRef(false);

  const { agencyId } = useSelector((state) => state.integrations || {});
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // 🔥 CAPTURE locationId EARLY - before any navigation
  useEffect(() => {
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    
    console.log('🔍 Early Capture Check');
    console.log('  - Current URL:', currentUrl);
    console.log('  - Referrer:', referrer);
    console.log('  - All search params:', Object.fromEntries(searchParams.entries()));
    
    // Check if we're coming from GHL custom menu link
    if (referrer.includes('app.gohighlevel.com') || currentUrl.includes('gohighlevel')) {
      
      // Try to extract locationId from referrer or current URL
      const extractLocationId = (url) => {
        console.log('  - Trying to extract from:', url);
        const patterns = [
          /\/location\/([a-zA-Z0-9_-]{15,25})/, // Standard: /location/ID
          /\/v2\/location\/([a-zA-Z0-9_-]{15,25})/, // V2: /v2/location/ID
          /locationId=([a-zA-Z0-9_-]{15,25})/, // Query: ?locationId=ID
          /location=([a-zA-Z0-9_-]{15,25})/, // Query: ?location=ID
          /subaccount=([a-zA-Z0-9_-]{15,25})/, // Query: ?subaccount=ID
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            console.log('  - ✅ Match found with pattern:', pattern);
            return match[1];
          }
        }
        return null;
      };
      
      let locationId = extractLocationId(referrer) || extractLocationId(currentUrl);
      
      // Also check URL params
      if (!locationId) {
        locationId = searchParams.get('locationId') || 
                     searchParams.get('location') || 
                     searchParams.get('subaccount');
        if (locationId) console.log('  - ✅ Found in URL params:', locationId);
      }
      
      if (locationId) {
        console.log('✅ Captured locationId:', locationId);
        sessionStorage.setItem('ghl_locationId', locationId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
      } else {
        console.log('❌ Could not extract locationId from any source');
      }
    }
  }, []); // Run once on mount

  // 🔥 Helper: Check if URL is from GoHighLevel
  const isFromGoHighLevel = () => {
    const referrer = document.referrer;
    const hasStoredLocation = !!sessionStorage.getItem('ghl_locationId');
    return referrer.includes('app.gohighlevel.com') || hasStoredLocation;
  };

  // 🔥 Helper: Get locationId from storage or URL
  const getLocationId = () => {
    console.log('🔍 Getting locationId...');
    
    // First check sessionStorage
    let locationId = sessionStorage.getItem('ghl_locationId');
    const captureTime = sessionStorage.getItem('ghl_captureTime');
    
    if (locationId) {
      console.log('  - Found in sessionStorage:', locationId);
      console.log('  - Capture time:', new Date(parseInt(captureTime || '0')).toISOString());
      
      // Clear if older than 5 minutes
      if (captureTime && Date.now() - parseInt(captureTime) > 5 * 60 * 1000) {
        console.log('  - ⚠️ LocationId expired (>5min), clearing');
        sessionStorage.removeItem('ghl_locationId');
        sessionStorage.removeItem('ghl_captureTime');
        locationId = null;
      } else {
        return locationId;
      }
    }
    
    // Check URL params
    locationId = searchParams.get('locationId') || 
                 searchParams.get('location') || 
                 searchParams.get('subaccount');
    
    if (locationId) {
      console.log('  - Found in URL params:', locationId);
    } else {
      console.log('  - ❌ Not found in sessionStorage or URL params');
    }
    
    return locationId;
  };

  // 1️⃣ UNIFIED EFFECT: Handle all navigation logic in one place
  useEffect(() => {
    const handleNavigation = async () => {
      // 🛑 Prevent multiple runs
      if (hasRedirected.current || isProcessing.current || !isAuthenticated) return;
      
      // 🛑 Only run on root or /app paths
      if (location.pathname !== '/' && location.pathname !== '/app') return;

      const subaccountParam = searchParams.get("subaccount");
      const agencyidParam = searchParams.get("agencyid");
      const isFromGHL = isFromGoHighLevel();
      
      console.log('🔍 Navigation check:', {
        path: location.pathname,
        isFromGHL,
        hasSubaccount: !!subaccountParam,
        hasAgency: !!agencyidParam
      });

      // CASE 1: Coming from GoHighLevel without params - need to fetch and redirect
      if (isFromGHL && !subaccountParam) {
        const locationId = getLocationId();
        
        console.log('🔍 GHL detected, locationId:', locationId);
        
        if (!locationId) {
          console.warn('⚠️ No locationId found, fetching all subaccounts...');
          
          // 🔥 FALLBACK: Fetch subaccounts and use first one if only one exists
          try {
            isProcessing.current = true;
            const result = await dispatch(fetchImportedSubAccounts());
            const fetchedSubAccounts = result.payload?.data || [];
            const fetchedAgencyId = result.payload?.agencyId || null;
            
            console.log('📦 Fetched subaccounts:', fetchedSubAccounts);
            
            if (fetchedSubAccounts.length === 1) {
              console.log('✅ Only one subaccount found, using it automatically');
              const account = fetchedSubAccounts[0];
              const finalAgencyId = account.companyId || fetchedAgencyId || companyDetails?.id || agencyId;
              
              const params = new URLSearchParams({
                agencyid: finalAgencyId,
                subaccount: account.id,
                allow: "yes",
                myname: encodeURIComponent(account.name || "NoName"),
                myemail: encodeURIComponent(account.email || "noemail@example.com"),
                route: "/assistants",
              });
              
              hasRedirected.current = true;
              sessionStorage.removeItem('ghl_locationId'); // Clean up
              navigate(`/app?${params.toString()}`, { replace: true });
              return;
            } else {
              console.warn('⚠️ Multiple subaccounts found, cannot auto-select');
              isProcessing.current = false;
              sessionStorage.removeItem('ghl_locationId'); // Clean up
              return;
            }
          } catch (error) {
            console.error('❌ Fallback error:', error);
            isProcessing.current = false;
            sessionStorage.removeItem('ghl_locationId'); // Clean up
            return;
          }
        }

        try {
          isProcessing.current = true;
          hasRedirected.current = true;
          
          console.log('📥 Fetching subaccounts for locationId:', locationId);
          
          const result = await dispatch(fetchImportedSubAccounts());
          
          // 🔥 FIX: The API response structure is { status, data: [...], agencyId }
          const apiResponse = result.payload;
          const fetchedSubAccounts = Array.isArray(apiResponse?.data) 
            ? apiResponse.data 
            : (Array.isArray(apiResponse) ? apiResponse : []);
          const fetchedAgencyId = apiResponse?.agencyId || null;
          
          console.log('📦 API Response:', apiResponse);
          console.log('📦 Fetched subaccounts:', fetchedSubAccounts);
          console.log('🏢 Agency ID:', fetchedAgencyId);
          console.log('🏢 Agency ID:', fetchedAgencyId);
          
          // Find matching account by locationId
          const matchingAccount = fetchedSubAccounts.find(acc => acc.id === locationId);
          
          if (!matchingAccount) {
            console.warn('❌ No matching subaccount found for locationId:', locationId);
            isProcessing.current = false;
            hasRedirected.current = false;
            sessionStorage.removeItem('ghl_locationId'); // Clean up
            return;
          }
          
          console.log('✅ Found matching account:', matchingAccount);

          const targetRoute = searchParams.get("route") || "/assistants";
          const finalAgencyId = matchingAccount.companyId || fetchedAgencyId || companyDetails?.id || agencyId;
          
          const params = new URLSearchParams({
            agencyid: finalAgencyId,
            subaccount: matchingAccount.id,
            allow: "yes",
            myname: encodeURIComponent(matchingAccount.name || "NoName"),
            myemail: encodeURIComponent(matchingAccount.email || "noemail@example.com"),
            route: targetRoute,
          });

          console.log('🚀 GHL Navigation to:', `/app?${params.toString()}`);

          sessionStorage.removeItem('ghl_locationId'); // Clean up after successful navigation
          navigate(`/app?${params.toString()}`, { replace: true });
          
        } catch (error) {
          console.error('❌ GHL Navigation Error:', error);
          isProcessing.current = false;
          hasRedirected.current = false;
          sessionStorage.removeItem('ghl_locationId'); // Clean up
        }
        return;
      }

      // CASE 2: Already have params (from GHL or direct) - just redirect to /app
      if (location.pathname === "/" && subaccountParam && agencyidParam) {
        hasRedirected.current = true;
        console.log("🚀 Redirecting to /app with existing params");

        const params = new URLSearchParams(searchParams);
        if (!params.get("route")) params.set("route", "/assistants");
        if (!params.has("allow")) params.set("allow", "yes");

        sessionStorage.removeItem('ghl_locationId'); // Clean up
        navigate(`/app?${params.toString()}`, { replace: true });
        return;
      }

      // CASE 3: Coming from GHL but already on /app with params - do nothing
      if (location.pathname === "/app" && subaccountParam) {
        console.log("✅ Already on /app with correct params");
        sessionStorage.removeItem('ghl_locationId'); // Clean up
        return;
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