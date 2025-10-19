import React from "react";
import { Bot } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Bot className="text-4xl text-sky-500 mb-4" />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Enter the email associated with your account and we’ll send you
          instructions to reset your password.
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            Send Instructions
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
