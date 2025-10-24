import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${BaseUrl}/auth/activate/${token}`
        );
        console.log("Verification response:", response.data);
        const successMsg =
          response.data.message || "Email verified successfully!";
        setMessage(successMsg);
        setStatus("success");

        // Save token to sessionStorage (optional)
        if (token) sessionStorage.setItem("token", token);

        // // Redirect after a delay
        // setTimeout(() => navigate("/"), 3000);
      } catch (error) {
        console.error("Verification error:", error);

        const errorMsg =
          error.response?.data?.message ||
          "Verification failed. The activation link may have expired.";

        setMessage(errorMsg);
        setStatus("error");

        // Clear token if it exists
        sessionStorage.removeItem("token");
      }
    };

    if (token) verifyEmail();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Verifying Your Email...
            </h2>
            <p className="text-gray-600">Please wait while we confirm your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-green-700">
              Email Verified!
            </h2>
            <p className="text-green-600 mb-4">{message}</p>
            <p className="text-gray-500 text-sm">
              Redirecting you to login page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-red-700">
              Verification Failed
            </h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset Link
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
