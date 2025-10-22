import React, { useEffect, useState } from "react";
import { Bot, CheckCircle, XCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { verifyToken } from "../store/slices/authSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); 

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        await dispatch(verifyToken(token)).unwrap();
        setStatus("success");
        setTimeout(() => navigate("/login"), 2000);
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [dispatch, navigate, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Bot className="text-4xl text-sky-500 mb-4" />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <h2 className="text-lg font-semibold">Verifying your email...</h2>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="text-green-500 mx-auto mb-2" size={40} />
            <h2 className="text-lg font-semibold">Email Verified!</h2>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting you to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="text-red-500 mx-auto mb-2" size={40} />
            <h2 className="text-lg font-semibold">Verification Failed</h2>
            <p className="text-sm text-gray-500 mt-2">
              The link may be invalid or expired.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="mt-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
