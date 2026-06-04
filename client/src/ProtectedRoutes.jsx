// src/ProtectedRoutes.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { verifyToken, refreshAccessToken } from "./store/slices/authSlice";

const ProtectedRoute = ({ children }) => {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const { isAuthenticated, accessToken, refreshToken } = useSelector((s) => s.auth);

  const hasVerified = useRef(false);

  // verifying = true while we are in the middle of a verify + possible refresh cycle.
  // We must NOT redirect to login during this window — the refresh might still succeed.
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Only run once per mount
      if (hasVerified.current) return;

      const storedAccessToken  = accessToken  || localStorage.getItem("accessToken");
      const storedRefreshToken = refreshToken || localStorage.getItem("refreshToken");

      // No tokens at all — let the render logic redirect to login
      if (!storedAccessToken && !storedRefreshToken) return;

      // Already authenticated (Redux was hydrated from localStorage on init) — nothing to do
      if (isAuthenticated) return;

      // We have token(s) but Redux doesn't yet know we're authenticated — verify/refresh
      hasVerified.current = true;
      setVerifying(true);

      try {
        if (storedAccessToken) {
          // Try to verify the access token first
          const result = await dispatch(verifyToken(storedAccessToken));

          // If access token is stale/invalid, try the refresh token
          if (verifyToken.rejected.match(result) && storedRefreshToken) {
            await dispatch(refreshAccessToken(storedRefreshToken));
          }
        } else if (storedRefreshToken) {
          // No access token but there is a refresh token — exchange it
          await dispatch(refreshAccessToken(storedRefreshToken));
        }
      } finally {
        // Always unblock rendering after the cycle completes, even on error
        setVerifying(false);
      }
    };

    initAuth();
  }, [dispatch, accessToken, refreshToken, isAuthenticated]);

  // ── No tokens at all → login ──────────────────────────────────────────────
  if (
    !accessToken &&
    !refreshToken &&
    !localStorage.getItem("accessToken") &&
    !localStorage.getItem("refreshToken")
  ) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Mid-verification spinner — do NOT redirect yet ────────────────────────
  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        <p className="text-sm text-gray-400 font-medium">Verifying session…</p>
      </div>
    );
  }

  // ── Verification finished but auth failed → login ─────────────────────────
  if (!isAuthenticated && hasVerified.current) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
