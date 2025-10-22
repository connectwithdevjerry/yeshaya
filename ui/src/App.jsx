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
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

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
  const authPaths = ["/login", "/register", "/reset-password", "/verify-email"];
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
          !isAuthPage && isAuthenticated ? "ml-64" : ""
        } overflow-y-auto`}
      >
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
           <Route path="/verify" element={<VerifyEmail />} />

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
