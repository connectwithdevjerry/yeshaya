import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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

export default function MainContent() {
  const location = useLocation();

  const pageTitles = {
    // --- Agency Section ---
    "/": "Accounts",
    "/agency": "Agency",
    "/integrations": "Integrations",
    "/rebilling": "Rebilling",
    "/settings": "Settings",
    "/dashboard": "Dashboard",

    // --- Communication Section ---
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

    // --- Integration Status Pages ---
    "/connection-success": "Integration Success",
    "/connection-failed": "Integration Failed",
    "/payment/connection-success": "Payment Success",
    "/payment/connection-failed": "Payment Failed",
  };

  const currentTitle =
    pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <Header title={currentTitle} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* --- Agency Routes --- */}
          <Route path="/" element={<SubAccounts />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/rebilling" element={<Rebilling />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* --- Communication Routes --- */}
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/call" element={<CallCenter />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/assistants" element={<Assistants />} />
          <Route path="/assistants/:id" element={<AssistantBuilderPage />} />
          <Route path="/activetags" element={<Tags />} />
          <Route path="/numbers" element={<Numbers />} />
          <Route path="/pools" element={<NumberPool />} />
          <Route path="/widgets" element={<Widgets />} />
          <Route path="/helps" element={<Helps />} />
          <Route path="/ghl_settings" element={<GHLSettings />} />

          {/* --- Integration Status Routes --- */}
          <Route path="/connection-success/:message" element={<GHLConnectionSuccess />} />
          <Route path="/connection-failed" element={<GHLConnectionFailed />} />
          <Route
            path="/payment/connection-success/:message"
            element={<StripeConnectionSuccess />}
          />
          <Route
            path="/payment/connection-failed/:message"
            element={<StripeConnectionFailed />}
          />
        </Routes>
      </main>
    </div>
  );
}
