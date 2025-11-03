import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Sidebar } from "./components/components-ui/Sidebar/Sidebar";
import { SidebarGHL } from "./components/components-ghl/Sidebar/Sidebar";
import { userInfo, navigationItems } from "./data/accountsData-ui";
import { navigationGHLItems } from "./data/accountsData-ghl";
import MainContent from "./MainContent";
import ProtectedRoute from "./ProtectedRoutes";
import { verifyToken } from "./store/slices/authSlice";

// Auth pages
import Login from "./pages/pages-ui/Login";
import Register from "./pages/pages-ui/Register";
import ResetLink from "./pages/pages-ui/ResetLink";
import VerifyEmail from "./pages/pages-ui/VerifyEmail";
import HomePage from "./pages/pages-ghl/Homepage";
import ResetPassword from "./pages/pages-ui/ForgotPassword";

function Layout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, token, isAuthenticated]);

  // Paths where Sidebar should NOT appear
  const authPaths = [
    "/homepage",
    "/login",
    "/register",
    "/reset-link",
    "/confirm_email_address",
  ];

  const ghlPaths = [
    "/inbox",
    "/call",
    "/contacts",
    "/knowledge",
    "/assistants",
    "/activetags",
    "/numbers",
    "/pools",
    "/widgets",
    "/helps",
    "/ghl_settings",
  ];

  const isAuthPage = authPaths.includes(location.pathname);
  const isGHLPage = ghlPaths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="flex h-screen bg-gray-50">
      {!isAuthPage &&
        isAuthenticated &&
        (isGHLPage ? (
          <SidebarGHL
            userInfo={userInfo}
            navigationItems={navigationGHLItems}
          />
        ) : (
          <Sidebar userInfo={userInfo} navigationItems={navigationItems} />
        ))}

      {/* Main Area */}
      <div
        className={`flex-1 ${
          !isAuthPage && isAuthenticated ? "" : ""
        } overflow-y-auto`}
      >
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-link" element={<ResetLink />} />
          <Route
            path="/confirm_email_address/:token"
            element={<VerifyEmail />}
          />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />
          <Route path="/homepage" element={<HomePage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainContent />
              </ProtectedRoute>
            }
          />
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
