import apiClient from "./config";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authAPI = {
  login: (formData) => {
    return apiClient.post("/auth/signin", formData);
  },

  register: (formData) => {
    return apiClient.post("/auth/signup", formData);
  },

  logout: () => {
    return apiClient.delete("/auth/logout");
  },

  resetPassword: (email) => {
    return apiClient.post("/auth/forgot_password", { email });
  },

  verifyToken: (accessToken) => {
    return apiClient.get(`/auth/activate/${accessToken}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  updatePassword: (passwordData) => {
    return apiClient.put("/auth/reset_password", passwordData);
  },

  // ✅ Changed from refreshToken to exchangeToken
  exchangeToken: (refreshToken) => {
    return apiClient.post("/auth/exchange-token", { refreshToken });
  },

  getCompanyDetails: () => {
    return apiClient.get("/auth/company-details");
  },

  registerCompany: (formData) => {
    return apiClient.post("/auth/register-company", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateCompanyDetails: (formData) => {
    return apiClient.post("/auth/company-details/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getUserDetails: () => {
    return apiClient.get("/auth/get-user-details");
  },
};