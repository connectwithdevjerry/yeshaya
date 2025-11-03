import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Bot, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import { login, clearError } from "../../store/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, accessToken, user } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [alertType, setAlertType] = useState(""); // "activation", "invalid", "server"

  // ✅ Navigate after successful login
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Save token to sessionStorage (optional)
      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("acces", accessToken);

      // Redirect to dashboard or home page
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, accessToken, user, navigate]);

  // ✅ Detect message type for alert styling
  useEffect(() => {
    if (typeof error === "string") {
      const lower = error.toLowerCase();
      if (lower.includes("activate")) {
        setAlertType("activation");
      } else if (
        lower.includes("invalid") ||
        lower.includes("incorrect") ||
        lower.includes("not found") ||
        lower.includes("wrong") ||
        lower.includes("email") ||
        lower.includes("password")
      ) {
        setAlertType("invalid");
      } else {
        setAlertType("server");
      }
    } else {
      setAlertType("");
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(login(formData));
  };  
  const renderAlert = () => {
    if (!error) return null;

    if (alertType === "activation") {
      return (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm">
          <div className="flex items-start gap-2">
            <Mail className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Account Not Activated</p>
              <p>{error}</p>
              <p className="text-xs mt-2">
                Didn’t receive the email?{" "}
                <Link
                  to="/reset-password"
                  className="font-semibold underline hover:no-underline"
                >
                  Request a new activation link
                </Link>
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (alertType === "invalid") {
      return (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      );
    }

    if (alertType === "server") {
      return (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Bot className="text-4xl text-sky-500 mb-4" size={48} />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Welcome back</h2>

        {renderAlert()}

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
            to="/reset-link"
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

          <p className="text-center text-sm text-gray-600 mt-4">
            New here?{" "}
            <Link to="/register" className="text-sky-600 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
