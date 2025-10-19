import React from "react";
import { Bot, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Bot className="text-4xl text-sky-500 mb-4" />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Welcome back</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="relative">
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
            <Eye className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <Link
            to="/reset-password"
            className="text-sm text-sky-600 hover:underline block text-right"
          >
            Forgot Password?
          </Link>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            Log In
          </button>
          <div className="flex items-center justify-center my-2 text-sm text-gray-400">
            <span>Continue with</span>
          </div>
          <button
            type="button"
            className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center hover:bg-gray-100"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          New here?{" "}
          <Link to="/register" className="text-sky-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
