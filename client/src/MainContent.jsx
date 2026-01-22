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
  
  // Refs to track state without re-triggering effects
  const hasRedirected = useRef(false);
  const isProcessing = useRef(false);

  const { agencyId } = useSelector((state) => state.integrations || {});
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // 🔥 1. CAPTURE locationId EARLY (Moved inside component)
  useEffect(() => {
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    
    // Performance API Extraction
    try {
      const resourceEntries = performance.getEntriesByType('resource');
      const ghlResources = resourceEntries.filter(entry => 
        entry.name.includes('gohighlevel.com') && entry.name.includes('/location/')
      );
      
      if (ghlResources.length > 0) {
        for (const resource of ghlResources) {
          const match = resource.name.match(/\/location\/([a-zA-Z0-9_-]{15,25})/);
          if (match) {
            sessionStorage.setItem('ghl_locationId', match[1]);
            sessionStorage.setItem('ghl_captureTime', Date.now().toString());
            return; 
          }
        }
      }
    } catch (perfError) {
      console.log('Performance API not available');
    }
    
    // Referrer/URL Extraction logic
    if (referrer.includes('app.gohighlevel.com') || currentUrl.includes('gohighlevel')) {
      const patterns = [
        /\/location\/([a-zA-Z0-9_-]{15,25})/,
        /\/v2\/location\/([a-zA-Z0-9_-]{15,25})/,
        /locationId=([a-zA-Z0-9_-]{15,25})/,
        /location=([a-zA-Z0-9_-]{15,25})/,
        /subaccount=([a-zA-Z0-9_-]{15,25})/,
      ];
      
      const extract = (url) => {
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) return match[1];
        }
        return null;
      };

      const locId = extract(referrer) || extract(currentUrl) || 
                    searchParams.get('locationId') || searchParams.get('location') || searchParams.get('subaccount');
      
      if (locId) {
        sessionStorage.setItem('ghl_locationId', locId);
        sessionStorage.setItem('ghl_captureTime', Date.now().toString());
      }
    }
  }, [searchParams]);

  // Helpers
  const isFromGoHighLevel = () => document.referrer.includes('app.gohighlevel.com') || !!sessionStorage.getItem('ghl_locationId');

  const getLocationId = () => {
    let locId = sessionStorage.getItem('ghl_locationId');
    const captureTime = sessionStorage.getItem('ghl_captureTime');
    
    if (locId && captureTime && Date.now() - parseInt(captureTime) > 5 * 60 * 1000) {
      sessionStorage.removeItem('ghl_locationId');
      sessionStorage.removeItem('ghl_captureTime');
      locId = null;
    }
    return locId || searchParams.get('locationId') || searchParams.get('location') || searchParams.get('subaccount');
  };

  // 🔥 2. UNIFIED NAVIGATION EFFECT
  useEffect(() => {
    const handleNavigation = async () => {
      if (hasRedirected.current || isProcessing.current || !isAuthenticated) return;
      if (location.pathname !== '/' && location.pathname !== '/app') return;

      const subaccountParam = searchParams.get("subaccount");
      const agencyidParam = searchParams.get("agencyid");
      const isFromGHL = isFromGoHighLevel();
      
      // CASE 1: From GHL without params
      if (isFromGHL && !subaccountParam) {
        const locationId = getLocationId();
        
        try {
          isProcessing.current = true;
          const result = await dispatch(fetchImportedSubAccounts());
          const apiResponse = result.payload;
          const fetchedSubAccounts = Array.isArray(apiResponse?.data) ? apiResponse.data : (Array.isArray(apiResponse) ? apiResponse : []);
          const fetchedAgencyId = apiResponse?.agencyId || null;
          
          const matchingAccount = locationId 
            ? fetchedSubAccounts.find(acc => acc.id === locationId)
            : (fetchedSubAccounts.length === 1 ? fetchedSubAccounts[0] : null);

          if (matchingAccount) {
            hasRedirected.current = true;
            const finalAgencyId = matchingAccount.companyId || fetchedAgencyId || companyDetails?.id || agencyId;
            
            const params = new URLSearchParams({
              agencyid: finalAgencyId,
              subaccount: matchingAccount.id,
              allow: "yes",
              myname: encodeURIComponent(matchingAccount.name || "NoName"),
              myemail: encodeURIComponent(matchingAccount.email || "noemail@example.com"),
              route: searchParams.get("route") || "/assistants",
            });

            sessionStorage.removeItem('ghl_locationId');
            navigate(`/app?${params.toString()}`, { replace: true });
          } else {
            isProcessing.current = false;
          }
        } catch (error) {
          console.error('Navigation Error:', error);
          isProcessing.current = false;
        }
        return;
      }

      // CASE 2: Basic root redirect with existing params
      if (location.pathname === "/" && subaccountParam && agencyidParam) {
        hasRedirected.current = true;
        const params = new URLSearchParams(searchParams);
        if (!params.get("route")) params.set("route", "/assistants");
        if (!params.has("allow")) params.set("allow", "yes");
        navigate(`/app?${params.toString()}`, { replace: true });
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