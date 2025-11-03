import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../api/authApi";

export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(formData);
      const data = response.data;

      if (data.status === false) {
        return rejectWithValue(data.message || "Login failed");
      }

      // ✅ Fix: use the correct property name from backend
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      console.log("Login success:", data);
      return data; // will be passed to reducer
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network or server error"
      );
    }
  }
);

export const register = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(formData);
      console.log("Registration response:", response.data);
      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }
      return response.data;
    } catch (error) {
      console.log("Error during registration:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please try again.";

      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();

      // ✅ Clear tokens on successful logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return { message: "Logged out successfully" };
    } catch (error) {
      // ✅ Always clear tokens even if server logout fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/forgot_password",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(email);
      return (
        response.data.message || "Reset link sent! Please check your email."
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to send reset email";
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (tokenFromLink, { rejectWithValue }) => {
    try {
      
      const token = tokenFromLink || localStorage.getItem("accessToken");
      if (!token) throw new Error("No token found");
      const response = await authAPI.verifyToken(token);
      localStorage.setItem("token", response.data.token);

      return response.data;
    } catch (error) {
      console.error("Token verification failed:", error);
      localStorage.removeItem("token");

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Token verification failed";

      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    accessToken: localStorage.getItem("accessToken") || null,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    loading: false,
    error: null,
    successMessage: null,
    registrationSuccess: false,
    verification: {
      loading: false,
      success: false,
      error: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
      state.registrationSuccess = false;
    },
    clearVerification: (state) => {
      state.verification = {
        loading: false,
        success: false,
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.registrationSuccess = true;
        state.successMessage =
          "Registration successful! Please check your email to activate your account.";
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.registrationSuccess = false;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.loading = false;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false; 
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
      })

      // RESET PASSWORD
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // VERIFY TOKEN
      .addCase(verifyToken.pending, (state) => {
        state.verification.loading = true;
        state.verification.error = null;
        state.verification.success = false;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.verification.loading = false;
        state.verification.success = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.verification.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.verification.loading = false;
        state.verification.success = false;
        state.verification.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { clearError, clearSuccessMessage, clearVerification } =
  authSlice.actions;
export default authSlice.reducer;
