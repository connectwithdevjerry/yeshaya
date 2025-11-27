import axios from "axios";

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
const isTokenExpired = (token, bufferSeconds = 60) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // ✅ Increased buffer to 60 seconds for better reliability
    return currentTime >= (expiryTime - (bufferSeconds * 1000));
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return true;
  }
};

// ✅ Centralized token refresh function
const refreshTokens = async () => {
  const refreshToken =
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // ✅ Check if refresh token is also expired
  if (isTokenExpired(refreshToken, 0)) {
    throw new Error("Refresh token expired");
  }

  try {
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

      return newAccessToken;
    } else {
      throw new Error("Token exchange failed");
    }
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    throw error;
  }
};

// ✅ Clear auth and redirect to login
const clearAuthAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = "/login";
  }
};

// ✅ Attach access token to each request
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token check for auth endpoints
    if (config.url?.includes('/auth/')) {
      return config;
    }

    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    
    if (!token) {
      return config;
    }

    // ✅ Check if token will expire soon (within 60 seconds)
    if (isTokenExpired(token, 60)) {
      console.log("⚠️ Access token expiring soon, refreshing...");
      
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

        const newAccessToken = await refreshTokens();
        
        // Update config with new token
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        
        // Process queued requests
        processQueue(null, newAccessToken);
        
        isRefreshing = false;
        return config;
      } catch (error) {
        console.error("❌ Token refresh in request interceptor failed:", error);
        isRefreshing = false;
        processQueue(error, null);
        
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
    } else {
      // Token is valid, attach it
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor - only handles 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      console.log("⚠️ 401 error detected, attempting token refresh");
      
      // Prevent infinite loops
      originalRequest._retry = true;

      try {
        // Wait if already refreshing
        if (isRefreshing) {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }

        isRefreshing = true;

        const newAccessToken = await refreshTokens();

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (err) {
        console.error("❌ Token refresh failed in response interceptor:", err);
        processQueue(err, null);
        isRefreshing = false;
        
        clearAuthAndRedirect();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;