import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { userInfo, navigationItems } from "./data/accountsData";
import MainContent from "./MainContent";
import ProtectedRoute from "./ProtectedRoutes";
import { verifyToken } from "./store/slices/authSlice";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetLink from "./pages/ResetLink";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ForgotPassword";

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
  const authPaths = ["/login", "/register", "/reset-link", "/confirm_email_address"];
  const isAuthPage = authPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar only for main dashboard pages */}
      {!isAuthPage && isAuthenticated && (
        <Sidebar userInfo={userInfo} navigationItems={navigationItems} />
      )}

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
          <Route path="/confirm_email_address/:token" element={<VerifyEmail />} />
          <Route path="/resetpassword/:token" element={<ResetPassword />} />

          {/* Dashboard/Main Area */}
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
