// src/MainContent.jsx
import React, { useEffect, useMemo } from "react";
import {
  Routes,
  Route,
  useLocation,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import { Header } from "./components/components-ui/Header";
import { useSelector } from "react-redux";

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
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useSelector((state) => state.auth || {});

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

  return (
    <div className="flex flex-col flex-1 relative">
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