// src/MainContent.jsx
import React, { useEffect, useMemo, useRef } from "react"; // Added useRef
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
  
  // ✅ Ref to ensure redirect logic only runs once
  const hasRedirected = useRef(false);

  const { agencyId } = useSelector((state) => state.integrations || {});
  const { companyDetails, isAuthenticated } = useSelector((state) => state.auth || {});

  // 1️⃣ Effect: Auto-navigate from GHL Custom Menu Link
  useEffect(() => {
    const handleGHLUrlNavigation = async () => {
      // Guard clauses: already redirected, not logged in, or wrong path
      if (hasRedirected.current || !isAuthenticated) return;
      if (location.pathname !== '/' && location.pathname !== '/app') return;
      
      const currentUrl = window.location.href;
      const referrer = document.referrer;
      
      const isCurrentUrlGHL = currentUrl.includes('app.gohighlevel.com') && currentUrl.includes('/location/') && currentUrl.includes('/custom-menu-link/');
      const isReferrerGHL = referrer && referrer.includes('app.gohighlevel.com') && referrer.includes('/location/') && referrer.includes('/custom-menu-link/');
      const referrerHasLocation = referrer && referrer.includes('app.gohighlevel.com') && referrer.includes('/location/');
      const locationIdFromParams = searchParams.get('locationId') || searchParams.get('location') || searchParams.get('subaccount');
      
      let locationId = null;

      if (isCurrentUrlGHL || isReferrerGHL) {
        const urlToCheck = isCurrentUrlGHL ? currentUrl : referrer;
        const locationMatch = urlToCheck.match(/\/location\/([^\/]+)\//);
        if (locationMatch) locationId = locationMatch[1];
      } else if (referrerHasLocation) {
        const locationMatch = referrer.match(/\/location\/([^\/]+)/);
        if (locationMatch) locationId = locationMatch[1];
      } else if (locationIdFromParams) {
        locationId = locationIdFromParams;
      }
      
      if (!locationId || searchParams.get('subaccount') === locationId) return;

      try {
        // ✅ Mark as redirected immediately to prevent parallel triggers
        hasRedirected.current = true;
        console.log('📥 Fetching subaccounts for custom menu link context...');
        
        const result = await dispatch(fetchImportedSubAccounts());
        const fetchedSubAccounts = result.payload?.locations || [];
        const fetchedAgencyId = result.payload?.agencyId || null;
        
        const matchingAccount = fetchedSubAccounts.find(acc => acc.id === locationId);
        
        if (!matchingAccount) {
          console.log('❌ No matching subaccount found.');
          hasRedirected.current = false; // Reset if fetch didn't yield a result
          return;
        }

        let targetRoute = "/assistants";
        if (location.pathname === "/app") {
          targetRoute = searchParams.get("route") || "/assistants";
        } else if (["/inbox", "/call", "/contacts", "/knowledge", "/assistants", "/activetags", "/numbers", "/pools", "/widgets", "/helps", "/ghl_settings", "/blog"].includes(location.pathname)) {
          targetRoute = location.pathname;
        }

        const finalAgencyId = matchingAccount.companyId || fetchedAgencyId || companyDetails?.id || agencyId || "UNKNOWN_COMPANY";
        
        const params = new URLSearchParams({
          agencyid: finalAgencyId,
          subaccount: matchingAccount.id,
          allow: "yes",
          myname: matchingAccount.name || "NoName",
          myemail: matchingAccount.email || "noemail@example.com",
          route: targetRoute,
        });

        setTimeout(() => {
          navigate(`/app?${params.toString()}`, { replace: true });
        }, 0);
        
      } catch (error) {
        console.error('❌ Redirect Error:', error);
        hasRedirected.current = false;
      }
    };
    
    handleGHLUrlNavigation();
  }, [location.pathname, isAuthenticated, dispatch, navigate, searchParams]);

  // 2️⃣ Effect: Handle basic GHL context redirect
  useEffect(() => {
    if (hasRedirected.current) return;

    const subaccount = searchParams.get("subaccount");
    const agencyid = searchParams.get("agencyid");
    const isGHLReferrer = document.referrer.includes("app.gohighlevel.com");
    
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    const isCustomMenuLink = (currentUrl.includes('/custom-menu-link/') && currentUrl.includes('/location/')) ||
                             (referrer.includes('/custom-menu-link/') && referrer.includes('/location/'));
    
    if (isCustomMenuLink) return;
    
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