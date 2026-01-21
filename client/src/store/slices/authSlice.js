import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authAPI } from "../api/authApi";
import axios from "axios";

export const login = createAsyncThunk(
  "auth/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(formData);
      const data = response.data;

      if (data.status === false) {
        return rejectWithValue(data.message || "Login failed");
      }

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      console.log("✅ Login success");
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network or server error",
      );
    }
  },
);

export const register = createAsyncThunk(
  "auth/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://api.yashayah.cloud/auth/signup",
        formData,
      );

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
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();

      // Clear tokens on successful logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      return { message: "Logged out successfully" };
    } catch (error) {
      // Always clear tokens even if server logout fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/forgot_password",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://api.yashayah.cloud/auth/forgot_password",
        { email },
      );

      return (
        response.data.message || "Reset link sent! Please check your email."
      );
    } catch (error) {
      console.error("Error during password reset:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to send reset email.";

      return rejectWithValue(errorMessage);
    }
  },
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
  },
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (refreshToken, { rejectWithValue }) => {
    try {
      console.log("🔄 Attempting to refresh token...");
      const response = await authAPI.refreshToken(refreshToken);
      const data = response.data;

      if (data.status === false) {
        return rejectWithValue(data.message || "Token refresh failed");
      }

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token received");
      }

      // Update localStorage with new tokens
      localStorage.setItem("accessToken", newAccessToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      console.log("✅ Token refreshed successfully");
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken,
      };
    } catch (error) {
      console.error("❌ Token refresh failed:", error);

      // Clear tokens on failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Token refresh failed";

      return rejectWithValue(errorMessage);
    }
  },
);

export const getCompanyDetails = createAsyncThunk(
  "auth/getCompanyDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://api.yashayah.cloud/auth/company-details",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = response.data;
      if (data.status === false) {
        return rejectWithValue(
          data.message || "Failed to load company details",
        );
      }

      // localStorage.setItem("companyDetails", JSON.stringify(data.data || null));
      return data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Network error";
      return rejectWithValue(msg);
    }
  },
);

export const registerCompany = createAsyncThunk(
  "auth/registerCompany",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://api.yashayah.cloud/auth/register-company",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = response.data;
      if (data.status === false) {
        return rejectWithValue(data.message || "Registration failed");
      }

      return data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Network error";
      return rejectWithValue(msg);
    }
  },
);

export const updateCompanyDetails = createAsyncThunk(
  "auth/updateCompanyDetails",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://api.yashayah.cloud/auth/company-details/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = response.data;
      if (data.status === false) {
        return rejectWithValue(data.message || "Update failed");
      }

      return data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Network error";
      return rejectWithValue(msg);
    }
  },
);

// Fetch User Details Thunk
export const getUserDetails = createAsyncThunk(
  "auth/getUserDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "https://api.yashayah.cloud/auth/get-user-details",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      const data = response.data;
      if (data.status === false) {
        return rejectWithValue(data.message || "Failed to load user details");
      }

      localStorage.setItem("user", JSON.stringify(data.data || null));
      return data.data;
    } catch (error) {
      const msg =
        error.response?.data?.message || error.message || "Network error";
      return rejectWithValue(msg);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
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
    refreshing: false,
    companyDetails: JSON.parse(
      localStorage.getItem("companyDetails") || "null",
    ),
    companyLoading: false,
    companyError: null,
    company: null,
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
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.companyDetails = null;
    },
    resetRegistrationStatus: (state) => {
      state.registrationSuccess = false;
      state.error = null;
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
        state.user = null;
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
        state.user = null;
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
      })

      // REFRESH TOKEN
      .addCase(refreshAccessToken.pending, (state) => {
        state.refreshing = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.refreshing = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || state.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.refreshing = false;
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.error = action.payload || "Session expired. Please login again.";
      })

      // Add the company details handlers
      .addCase(getCompanyDetails.pending, (state) => {
        state.companyLoading = true;
        state.companyError = null;
      })
      .addCase(getCompanyDetails.fulfilled, (state, action) => {
        state.companyLoading = false;
        state.companyDetails = action.payload;
        state.companyError = null;
      })
      .addCase(getCompanyDetails.rejected, (state, action) => {
        state.companyLoading = false;
        state.companyError = action.payload || "Failed to load company details";
        state.companyDetails = null;
      })

      // Register Company Cases
      .addCase(registerCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
        state.registrationSuccess = true;
      })
      .addCase(registerCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })

      // Update Company Details Cases
      .addCase(updateCompanyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompanyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload;
      })
      .addCase(updateCompanyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Details Cases
      .addCase(getUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  clearVerification,
  setTokens,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
