import axios from "axios";
import store from "../store";
import { refreshAccessToken } from "../slices/authSlice";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_D_BASE_URL;

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

// ✅ Attach access token to each request
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle expired JWT
apiClient.interceptors.response.use(
  async (response) => {
    // Check if the API returns a "jwt expired" message even on success
    if (
      response?.data?.message &&
      typeof response.data.message === "string" &&
      response.data.message.toLowerCase().includes("jwt expired")
    ) {
      const originalRequest = response.config;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken =
            localStorage.getItem("refreshToken") ||
            sessionStorage.getItem("refreshToken");

          if (!refreshToken) throw new Error("No refresh token available");

          const { payload, error } = await store.dispatch(
            refreshAccessToken(refreshToken)
          );

          if (error || !payload?.accessToken)
            throw new Error("Failed to refresh token");

          const newAccessToken = payload.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (err) {
          processQueue(err, null);
          isRefreshing = false;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(err);
        }
      } else {
        // Wait until refresh finishes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            response.config.headers.Authorization = `Bearer ${token}`;
            return apiClient(response.config);
          })
          .catch((err) => Promise.reject(err));
      }
    }

    return response;
  },
  async (error) => {
    // If the backend sends a 401, also handle refresh
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 ||
        error.response?.data?.message === "jwt expired") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      if (isRefreshing) {
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

        if (!refreshToken) throw new Error("No refresh token available");

        const { payload, error: refreshError } = await store.dispatch(
          refreshAccessToken(refreshToken)
        );

        if (refreshError) throw refreshError;

        const newAccessToken = payload?.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
