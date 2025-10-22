// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Bot, Eye, EyeOff } from "lucide-react";
import { login, clearError } from "../store/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleGoogleLogin = () => {
    // Implement Google OAuth
    console.log("Google login not implemented yet");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Bot className="text-4xl text-sky-500 mb-4" size={48} />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Welcome back</h2>

        {error && (
          <div className="transition-all duration-300 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {typeof error === "string"
              ? error
              : error.message || "Login failed"}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <Link
            to="/reset-password"
            className="text-sm text-sky-600 hover:underline block text-right"
          >
            Forgot Password?
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          <div className="flex items-center justify-center my-2 text-sm text-gray-400">
            <span>Continue with</span>
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
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
