// src/components/ProtectedRoute.jsx
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { verifyToken } from "./store/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, loading, token } = useSelector((state) => state.auth);


  const hasVerified = useRef(false);

  useEffect(() => {
    if (!hasVerified.current && token && token.trim() !== "") {
      hasVerified.current = true; // prevent loop
      dispatch(verifyToken());
    }
  }, [dispatch, token]);

  if (!token || token.trim() === "") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ✅ Redirect if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;
