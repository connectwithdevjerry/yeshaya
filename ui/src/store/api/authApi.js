
import apiClient from './config';

export const authAPI = {
  login: (formData) => {
    return apiClient.post('/auth/signin', formData);
  },

  register: (formData) => {
    return apiClient.post('/auth/signup', formData);
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  resetPassword: (email) => {
    return apiClient.post('/auth/reset-password', { email });
  },

  verifyToken: (token) => {
    return apiClient.get('/auth/activate', {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updatePassword: (passwordData) => {
    return apiClient.put('/auth/password', passwordData);
  },
};