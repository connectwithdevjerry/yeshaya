import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { verifyToken } from "../store/slices/authSlice";

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { verification } = useSelector((state) => state.auth);
  const { loading, success, error } = verification;

  useEffect(() => {
    if (token) {
      dispatch(verifyToken(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (success) {
      // Give a short delay before redirecting to home
      setTimeout(() => navigate("/"), 1500);
    }
  }, [success, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        {loading && (
          <>
            <Loader2 className="animate-spin text-sky-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Verifying your email...</h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </>
        )}

        {!loading && success && (
          <>
            <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Email Verified!</h2>
            <p className="text-gray-500">Redirecting to your dashboard...</p>
          </>
        )}

        {!loading && error && (
          <>
            <XCircle className="text-red-500 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-4">
              {/* {error === "Token expired or invalid"
                ? "Your verification link has expired."
                : "Something went wrong during verification."} */}
              YOur verification link is invalid or has expired.
            </p>
            <p className="text-sm text-gray-600">
              Please click{" "}
              <Link to="/reset-password" className="text-sky-600 hover:underline">
                Forgot Password
              </Link>{" "}
              to request a new activation link.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
