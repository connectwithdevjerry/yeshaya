import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const BaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    newPassword: "",
    cnewPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null); // "success" | "error"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.cnewPassword) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${BaseUrl}/auth/reset_password`, {
        token,
        newPassword: formData.newPassword,
        cnewPassword: formData.cnewPassword,
      });

      console.log("Reset response:", response.data);
      setMessage(response.data.message || "Password reset successful!");
      setStatus("success");

      // Redirect to login after a short delay
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Reset error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Password reset failed. Please try again.";
      setMessage(errorMsg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Field */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="cnewPassword"
              value={formData.cnewPassword}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Confirm new password"
            />
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-center text-sm ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-5">
          Remember your password?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Go to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
