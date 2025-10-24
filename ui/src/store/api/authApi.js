
import apiClient from './config';

export const authAPI = {
  login: (formData) => {
    return apiClient.post('/auth/signin', formData);
  },

  register: (formData) => {
    return apiClient.post('/auth/signup', formData);
  },

  logout: () => {
    return apiClient.del('/auth/logout');
  },

  resetPassword: (email) => {
    return apiClient.post('/auth/forgot_password', { email });
  },

  verifyToken: (token) => {
    return apiClient.get(`/auth/activate/${token}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updatePassword: (passwordData) => {
    return apiClient.put('/auth/reset_password', passwordData);
  },
};