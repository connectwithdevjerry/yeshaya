import React, { useState, useEffect } from "react";
import { Bot, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError, clearSuccessMessage } from "../store/slices/authSlice";

const ResetLink = () => {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setSubmitted(true);
    }
  }, [successMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(false);
    dispatch(resetPassword(email));
  };

  // Success State
  if (submitted && successMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Bot className="text-4xl text-sky-500 mb-4" size={48} />
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            {successMessage}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Email:</strong> {email}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in your email to reset your password or activate your account.
          </p>

          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
                  setSubmitted(false);
                  dispatch(clearSuccessMessage());
                }}
                className="text-sky-600 hover:underline"
              >
                try again
              </button>
            </p>
            
            <Link
              to="/login"
              className="block w-full border border-gray-300 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Bot className="text-4xl text-sky-500 mb-4" size={48} />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-2">
          Reset Password / Request Activation Link
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          Enter your email address and we'll send you a link to reset your password or activate your account.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {typeof error === "string" ? error : error.message || "Something went wrong."}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Link"}
          </button>

          <Link
            to="/login"
            className="w-full block text-center border border-gray-200 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to Login
          </Link>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            This will send a link to reset your password or activate your account if it hasn't been activated yet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetLink;