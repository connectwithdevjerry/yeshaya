import React from "react";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StripeConnectionFailed = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-center">
      <XCircle className="text-red-600 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-semibold text-red-700 mb-2">
        Connection Failed
      </h1>
      <p className="text-gray-600 mb-6">
        Something went wrong while connecting to your Stripe Account.
      </p>
      <button
        onClick={() => navigate("/integrations")}
        className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition"
      >
        Try Again
      </button>
    </div>
  );
};

export default StripeConnectionFailed;
