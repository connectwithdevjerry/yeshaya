import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { userInfo, navigationItems } from "./data/accountsData";
import MainContent from "./MainContent";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Homepage from "./pages/Homepage";

function Layout() {
  const location = useLocation();

  const noSidebarPaths = ["/", "/login", "/register", "/reset-password"];
  const showSidebar = !noSidebarPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      {showSidebar && (
        <Sidebar userInfo={userInfo} navigationItems={navigationItems} />
      )}

      {/* Main Area */}
      <div className={`flex-1 ${showSidebar ? "ml-56" : ""} overflow-y-auto`}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
