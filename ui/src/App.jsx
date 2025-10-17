import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { userInfo, navigationItems } from "./data/accountsData";
import MainContent from "./MainContent";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/pages/ResetPassword";

function Layout() {
  const location = useLocation();

  // Paths where Sidebar should NOT appear
  const authPaths = ["/login", "/register", "/reset-password"];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar only for main dashboard pages */}
      {!isAuthPage && (
        <Sidebar userInfo={userInfo} navigationItems={navigationItems} />
      )}

      {/* Main Area */}
      <div className="flex-1">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard/Main Area */}
          <Route path="/*" element={<MainContent />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
