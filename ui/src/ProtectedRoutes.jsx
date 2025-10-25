import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { verifyToken } from "./store/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, accessToken } = useSelector((state) => state.auth);

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!hasVerified.current && accessToken && accessToken.trim() !== "" && !isAuthenticated) {
      hasVerified.current = true;
      dispatch(verifyToken());
    }
  }, [dispatch, accessToken, isAuthenticated]);


  if (!accessToken || accessToken.trim() === "") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Loading - show spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;