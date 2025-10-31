import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'
  const [expired, setExpired] = useState(false);
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${BaseUrl}/auth/activate/${token}`, {
          headers: { Accept: "application/json" },
          validateStatus: (status) => status < 500, 
        });

        if (
          response.data &&
          typeof response.data === "object" &&
          (response.data.status === true ||
            response.data.message?.toLowerCase().includes("verified"))
        ) {
          setMessage(response.data.message || "Email verified successfully!");
          setStatus("success");

          // Redirect after delay
          setTimeout(() => navigate("/login"), 2500);
        } else {
          throw new Error("Invalid response or email not verified");
        }
      } catch (error) {
        console.error("Verification error:", error);

        let errorMsg = "Verification failed. The activation link may be invalid.";
        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (
          typeof error.response?.data === "string" &&
          error.response.data.includes("<!DOCTYPE html>")
        ) {
          // Detected ngrok or HTML response
          errorMsg = "Invalid server response — please open the link directly or contact support.";
        }

        setMessage(errorMsg);
        setStatus("error");

        // Detect expired token
        if (errorMsg.toLowerCase().includes("expired")) {
          setExpired(true);
        } else {
          setExpired(false);
        }
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
            <p className="text-gray-600">
              Please wait while we confirm your account.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-green-700">
              Email Verified!
            </h2>
            <p className="text-green-600 mb-4">{message}</p>
            <p className="text-gray-500 text-sm">
              Redirecting you to the login page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-red-700">
              Verification Failed
            </h2>
            <p className="text-red-600 mb-4">{message}</p>

            {expired ? (
              <button
                onClick={() => navigate("/reset-link")}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Click here to request a new link
              </button>
            ) : (
              <button
                onClick={() => navigate("/reset-link")}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reset Password
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
