// src/MainContent.jsx
import React, { useEffect, useMemo } from "react";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { Header } from "./components/components-ui/Header";

// ---- Pages from Agency section ----
import Agency from "./pages/pages-ui/Agency"
import Integrations from "./pages/pages-ui/Integrations"
import Rebilling from "./pages/pages-ui/Rebilling"
import Settings from "./pages/pages-ui/Settings"
import SubAccounts from "./pages/pages-ui/SubAccounts"
import DashboardPage from "./pages/pages-ui/Dashboard"

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
import GHLSettings from './pages/pages-ghl/Settings';
import { AssistantBuilderPage } from "./components/components-ghl/AssistantsBuilder/AssistantsBuilder";

// ✅ Component to render based on route parameter
const AppRouter = () => {
  const [searchParams] = useSearchParams();
  const route = searchParams.get('route') || '/assistants';

  // Store account data in sessionStorage
  useEffect(() => {
    const agencyid = searchParams.get('agencyid');
    const subaccount = searchParams.get('subaccount');
    const allow = searchParams.get('allow');
    const myname = searchParams.get('myname');
    const myemail = searchParams.get('myemail');
    
    if (agencyid && subaccount) {
      const accountData = {
        agencyid,
        subaccount,
        allow,
        myname,
        myemail
      };
      sessionStorage.setItem('currentAccount', JSON.stringify(accountData));
      console.log("✅ Account stored:", accountData);
    }
  }, [searchParams]);

  // Route mapping
  const routeComponents = {
    '/assistants': <Assistants />,
    '/inbox': <Inbox />,
    '/call': <CallCenter />,
    '/contacts': <Contacts />,
    '/knowledge': <Knowledge />,
    '/activetags': <Tags />,
    '/numbers': <Numbers />,
    '/pools': <NumberPool />,
    '/widgets': <Widgets />,
    '/helps': <Helps />,
    '/ghl_settings': <GHLSettings />,
    '/agency': <Agency />,
    '/dashboard': <DashboardPage />,
  };

  // ✅ Handle dynamic routes like /assistants/:id
  if (route.startsWith('/assistants/')) {
    return <AssistantBuilderPage />;
  }

  return routeComponents[route] || <Assistants />;
};

export default function MainContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get page title based on route parameter
  const pageTitles = useMemo(() => ({
    '/': "Accounts",
    '/agency': "Agency",
    '/integrations': "Integrations",
    '/rebilling': "Rebilling",
    '/settings': "Settings",
    '/dashboard': "Dashboard",
    '/inbox': "Inbox",
    '/call': "Call Center",
    '/contacts': "Contacts",
    '/knowledge': "Knowledge",
    '/assistants': "Assistants",
    '/activetags': "Active Tags",
    '/numbers': "Numbers",
    '/pools': "Number Pools",
    '/widgets': "Widgets",
    '/helps': "Help Center",
    '/ghl_settings': "Settings",
    '/connection-success': "Integration Success",
    '/connection-failed': "Integration Failed",
    '/payment/connection-success': "Payment Success",
    '/payment/connection-failed': "Payment Failed",
  }), []);

  const getCurrentTitle = () => {
    // For /app routes, get title from route parameter
    if (location.pathname === '/app') {
      const route = searchParams.get('route') || '/assistants';
      
      // ✅ Handle dynamic assistant routes
      if (route.startsWith('/assistants/')) {
        return "Assistant Builder";
      }
      
      return pageTitles[route] || "Dashboard";
    }
    // For regular routes, use pathname
    return pageTitles[location.pathname] || "Dashboard";
  };

  const currentTitle = getCurrentTitle();

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <Header title={currentTitle} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* --- Agency Routes (No account context) --- */}
          <Route path="/" element={<SubAccounts />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/rebilling" element={<Rebilling />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* --- /app Route (WITH account context) --- */}
          <Route path="/app" element={<AppRouter />} />

          {/* --- Integration Status Routes --- */}
          <Route path="/connection-success/:message" element={<GHLConnectionSuccess />} />
          <Route path="/connection-failed" element={<GHLConnectionFailed />} />
          <Route path="/payment/connection-success/:message" element={<StripeConnectionSuccess/>} />
          <Route path="/payment/connection-failed/:message" element={<StripeConnectionFailed />} />
        </Routes>
      </main>
    </div>
  );
}