import React from "react";
import { Bot, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Bot className="text-4xl text-sky-500 mb-4" />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Create an account</h2>
        <form className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="First name"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="text"
              placeholder="Last name"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
            <Eye className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
          >
            Get Started Today
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            By signing up, you agree to our{" "}
            <span className="text-sky-600">Terms of Service</span>,{" "}
            <span className="text-sky-600">Usage Policy</span>, and{" "}
            <span className="text-sky-600">Privacy Policy</span>.
          </p>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-600 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
