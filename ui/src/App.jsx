import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { userInfo, navigationItems } from "./data/accountsData";
import MainContent from "./MainContent";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar userInfo={userInfo} navigationItems={navigationItems} />

        {/* Main Area (handles header + routes) */}
        <MainContent />
      </div>
    </Router>
  );
}
