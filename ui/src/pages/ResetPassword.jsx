import React, { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError } from "../store/slices/authSlice";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword(email));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Bot className="text-4xl text-sky-500 mb-4" />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Enter the email associated with your account and we’ll send you
          instructions to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {typeof error === "string" ? error : error.message || "Something went wrong."}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Instructions"}
          </button>

          <Link
            to="/login"
            className="w-full block text-center border border-gray-200 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
