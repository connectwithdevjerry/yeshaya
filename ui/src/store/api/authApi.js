
import apiClient from './config';

export const authAPI = {
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  resetPassword: (email) => {
    return apiClient.post('/auth/reset-password', { email });
  },

  verifyToken: (token) => {
    return apiClient.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updatePassword: (passwordData) => {
    return apiClient.put('/auth/password', passwordData);
  },
};