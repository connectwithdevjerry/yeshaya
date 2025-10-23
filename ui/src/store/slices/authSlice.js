import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../api/authApi";

export const login = createAsyncThunk(
  "auth/signin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem("token", response.data.token);
      console.log("Login successful:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(formData);
      localStorage.setItem("token", response.data.token);
      console.log("Registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.log("Error during registration:", error.response?.data);
      return rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      return { message: "Logged out successfully" };
    } catch (error) {
      // Still remove token even if request fails (e.g., network error)
      localStorage.removeItem("token");
      return rejectWithValue(error.response?.data || "Logout failed");
    } finally {
      localStorage.removeItem("token");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/activate",
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.message;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (tokenFromLink, { rejectWithValue }) => {
    try {
      // Priority: use token from link if available, else from localStorage
      const token = tokenFromLink || localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await authAPI.verifyToken(token);

      // Save the verified token to localStorage (optional)
      localStorage.setItem("token", token);

      return response.data;
    } catch (error) {
      localStorage.removeItem("token");
      return rejectWithValue(
        error.response?.data || "Token verification failed"
      );
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Email verification failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
    error: null,
    resetPasswordSuccess: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearResetPasswordSuccess: (state) => {
      state.resetPasswordSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false; // don't authenticate until verified
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage =
          "Registration successful. Please check your email to activate your account.";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetPasswordSuccess = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.resetPasswordSuccess = false;
      })
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // ---------------- VERIFY EMAIL ----------------
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.emailVerified = false;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
        state.emailVerified = true;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.emailVerified = false;
      });
  },
});

export const { clearError, clearResetPasswordSuccess } = authSlice.actions;
export default authSlice.reducer;
