import React, { useState, useEffect } from "react";
import { Bot, Eye, EyeOff, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError, clearSuccessMessage } from "../../store/slices/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const { loading, error, registrationSuccess, successMessage } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccessMessage());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  // ✅ If registration is successful — show the activation message
  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Bot className="text-4xl text-sky-500 mb-4" size={48} />
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
            <p className="text-gray-600 mb-4">
              {successMessage ||
                "We've sent an activation link to your email address."}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {formData.email}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Click the activation link in your email to verify your account and
              complete the registration process.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => {
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

  // ✅ Normal registration form with clear error display
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Bot className="text-4xl text-sky-500 mb-4" size={48} />
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">
          Create an account
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {typeof error === "string"
              ? error
              : error?.message || "Registration failed. Please try again."}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Get Started Today"}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2">
            By signing up, you agree to our{" "}
            <span className="text-sky-600 hover:underline">
              Terms of Service
            </span>
            , <span className="text-sky-600 hover:underline">Usage Policy</span>
            , and{" "}
            <span className="text-sky-600 hover:underline">Privacy Policy</span>.
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
