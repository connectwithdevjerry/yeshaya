import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import Inbox from "./pages/Inbox";
import CallCenter from "./pages/CallCenter";
import Contacts from "./pages/Contacts";
import Knowledge from "./pages/Knowledge";
import Assistants from "./pages/Assistants";
import Tags from "./pages/Tags";
import Numbers from "./pages/Number/Numbers";
import Widgets from "./pages/Widgets";
import Settings from "./pages/Settings";
import Helps from "./pages/Helps";
import { NumberPool } from "./pages/Number/Pools";
import { AssistantBuilderPage } from "./components/AssistantsBuilder/AssistantsBuilder";


export default function MainContent() {
  const location = useLocation();

  const pageTitles = {
    "/inbox": "Inbox",
    "/call": "Call Center",
    "/contacts": "Contacts",
    "/knowledge": "Knowledge",
    "/assistants": "Assistants",
    "/assistants/:id": "Assistants",
    "/activetags": "Active Tags",
    "/numbers": "Numbers",
    "/pools": "Numbers",
    "/widgets": "Widgets",
    "/settings": "Settings",
    "/helps": "Helps",
  };

const currentTitle = pageTitles[location.pathname];

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <Header title={currentTitle} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/call" element={<CallCenter />} />
          <Route path="/contacts" element={<Contacts />} />
        
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/assistants" element={<Assistants />} />
          <Route path="/activetags" element={<Tags />} />
          <Route path="/numbers" element={<Numbers />} />
          <Route path="/pools" element={<NumberPool />} />
          <Route path="/widgets" element={<Widgets />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/helps" element={<Helps />} />
          <Route path="assistants/:id" element={<AssistantBuilderPage />} />
        </Routes>
      </main>
    </div>
  );
}
