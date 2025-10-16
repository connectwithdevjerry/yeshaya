import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";

export default function MainContent() {
  const location = useLocation();

  const pageTitles = {
    "/": "Inbox",
    "/call": "Call Center",
    "/contacts": "Contacts",
    "/knowledge": "Knowledge",
    "/assistants": "Assistants",
    "/activetags": "Active Tags",
    "/numbers": "Numbers",
    "/widgets": "Widgets",
    "/settings": "Settings",
    "/helps": "Helps",
  };

  const currentTitle = pageTitles[location.pathname] || "Accounts";

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <Header title={currentTitle} />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
         
        </Routes>
      </main>
    </div>
  );
}
