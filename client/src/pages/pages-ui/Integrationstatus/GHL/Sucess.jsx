import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GHLConnectionSuccess = () => {
    const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 text-center">
      <CheckCircle className="text-green-600 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-semibold text-green-700 mb-2">
        Connection Successful 🎉
      </h1>
      <p className="text-gray-600 mb-6">
        Your GoHighLevel account has been successfully connected!
      </p>
      <button
        onClick={() => navigate("/integrations")}
        className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
      >
        Close Window
      </button>
    </div>
  );
};

export default GHLConnectionSuccess;
