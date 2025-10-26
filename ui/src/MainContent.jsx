import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";

import Agency from "./pages/Agency";
import Integrations from "./pages/Integrations";
import Rebilling from "./pages/Rebilling";
import Settings from "./pages/Settings";
import SubAccounts from "./pages/SubAccounts";
import GHLConnectionSuccess from "./pages/Integrationstatus/GHL/Sucess";
import GHLConnectionFailed from "./pages/Integrationstatus/GHL/Failure";
import DashboardPage from "./pages/Dashboard";
import StripeConnectionSuccess from "./pages/Integrationstatus/Stripe/Success";
import StripeConnectionFailed from "./pages/Integrationstatus/Stripe/Failure";


export default function MainContent() {
  const location = useLocation();

  const pageTitles = {
    "/": "Accounts",
    "/agency": "Agency",
    "/integrations": "Integrations",
    "/rebilling": "Rebilling",
    "/settings": "Settings",
  };

  const currentTitle = pageTitles[location.pathname] || "Accounts";

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <Header title={currentTitle} />

      {/* Main Content */}
      <main className="flex-1  overflow-y-auto">
        <Routes>
          <Route path="/" element={<SubAccounts />} />
          <Route path="/agency" element={<Agency />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/rebilling" element={<Rebilling />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Integrations Status Page */}
          <Route path="/connection-success" element={<GHLConnectionSuccess />} />
          <Route path="/connection-failed" element={<GHLConnectionFailed />} />
          <Route path="/payment/connection-success/:message" element={<StripeConnectionSuccess />} />
          <Route path="/payment/connection-failed/:message" element={<StripeConnectionFailed />} />
        </Routes>
      </main>
    </div>
  );
}
