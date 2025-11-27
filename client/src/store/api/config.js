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

// ✅ Check if token is expired by decoding JWT
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Add 30 second buffer to refresh before actual expiry
    return currentTime >= (expiryTime - 30000);
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
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

// ✅ Attach access token to each request and check expiry
apiClient.interceptors.request.use(
  async (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.log("⚠️ Access token expired before request, refreshing...");
        
        const refreshToken =
          localStorage.getItem("refreshToken") ||
          sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          console.error("❌ No refresh token available");
          window.location.href = "/login";
          return Promise.reject(new Error("No refresh token"));
        }

        // Check if refresh token is also expired
        if (isTokenExpired(refreshToken)) {
          console.error("❌ Both tokens expired, redirecting to login");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(new Error("Session expired"));
        }

        try {
          // Wait if already refreshing
          if (isRefreshing) {
            const newToken = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          }

          isRefreshing = true;

          // Call exchange-token endpoint
          const response = await axios.post(`${API_BASE_URL}/auth/exchange-token`, {
            refreshToken
          });

          if (response.data.status && response.data.accessToken) {
            const newAccessToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;

            // Update tokens
            localStorage.setItem("accessToken", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Update config with new token
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // Process queued requests
            processQueue(null, newAccessToken);
            
            isRefreshing = false;
            return config;
          } else {
            throw new Error("Token exchange failed");
          }
        } catch (error) {
          console.error("❌ Token refresh in request interceptor failed:", error);
          isRefreshing = false;
          processQueue(error, null);
          
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } else {
        // Token is valid, attach it
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    // Check if refresh token is expired
    if (isTokenExpired(refreshToken)) {
      throw new Error("Refresh token expired");
    }

    // Dispatch refresh token action using exchange-token
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