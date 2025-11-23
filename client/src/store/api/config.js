import axios from "axios";
import store from "../store";
import { refreshAccessToken } from "../slices/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ✅ Check if response contains JWT expired message
const isJWTExpired = (response) => {
  if (!response) return false;

  // Check in response data
  if (response.data) {
    const message = response.data.message || response.data.error || "";
    if (
      typeof message === "string" &&
      message.toLowerCase().includes("jwt expired")
    ) {
      return true;
    }
  }

  // Check in response status
  if (response.status === 401) {
    return true;
  }

  return false;
};

// ✅ Attach access token to each request
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle token refresh
const handleTokenRefresh = async (originalRequest) => {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  isRefreshing = true;

  try {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Dispatch refresh token action
    const { payload, error } = await store.dispatch(
      refreshAccessToken(refreshToken)
    );

    if (error || !payload?.accessToken) {
      throw new Error("Failed to refresh token");
    }

    const newAccessToken = payload.accessToken;

    // Update tokens in storage
    localStorage.setItem("accessToken", newAccessToken);
    if (payload.refreshToken) {
      localStorage.setItem("refreshToken", payload.refreshToken);
    }

    // Update axios default header
    apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

    // Process queued requests
    processQueue(null, newAccessToken);

    // Retry original request
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  } catch (err) {
    console.error("❌ Token refresh failed:", err);
    processQueue(err, null);

    // Clear tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    // Redirect to login
    window.location.href = "/login";

    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

// ✅ Response interceptor - handles both success and error responses
apiClient.interceptors.response.use(
  async (response) => {
    // Check if JWT expired even in successful responses
    if (isJWTExpired(response)) {
      console.log("⚠️ JWT expired detected in response");
      const originalRequest = response.config;

      // Prevent infinite loops
      if (originalRequest._retry) {
        console.error("❌ Token refresh already attempted");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired"));
      }

      originalRequest._retry = true;
      return handleTokenRefresh(originalRequest);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    if (
      error.response &&
      (error.response.status === 401 || isJWTExpired(error.response)) &&
      !originalRequest._retry
    ) {
      console.log("⚠️ JWT expired detected in error response");
      originalRequest._retry = true;
      return handleTokenRefresh(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
