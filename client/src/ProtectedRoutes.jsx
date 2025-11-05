// src/ProtectedRoutes.jsx

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { verifyToken, refreshAccessToken } from "./store/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, accessToken, refreshToken } = useSelector(
    (state) => state.auth
  );

  const hasVerified = useRef(false);

  useEffect(() => {
    const initAuth = async () => {

      if (hasVerified.current) return;
      
      const storedAccessToken = accessToken || localStorage.getItem("accessToken");
      const storedRefreshToken = refreshToken || localStorage.getItem("refreshToken");

      // No tokens at all - redirect to login
      if (!storedAccessToken && !storedRefreshToken) {
        return;
      }

      // Try to verify access token first
      if (storedAccessToken && !isAuthenticated) {
        hasVerified.current = true;
        const result = await dispatch(verifyToken(storedAccessToken));
        
        // If verification fails, try refresh token
        if (verifyToken.rejected.match(result) && storedRefreshToken) {
          console.log("🔄 Access token invalid, attempting refresh...");
          await dispatch(refreshAccessToken(storedRefreshToken));
        }
      }
      // If no access token but have refresh token, try refresh
      else if (!storedAccessToken && storedRefreshToken) {
        hasVerified.current = true;
        console.log("🔄 No access token, attempting refresh...");
        await dispatch(refreshAccessToken(storedRefreshToken));
      }
    };

    initAuth();
  }, [dispatch, accessToken, refreshToken, isAuthenticated]);

  // No tokens - redirect to login
  if (!accessToken && !refreshToken && !localStorage.getItem("accessToken") && !localStorage.getItem("refreshToken")) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Loading state
  if (loading || (!isAuthenticated && hasVerified.current)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
      </div>
    );
  }

  // Not authenticated after verification - redirect to login
  if (!isAuthenticated && hasVerified.current) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;