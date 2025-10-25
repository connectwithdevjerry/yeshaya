
import apiClient from './config';

export const authAPI = {
  login: (formData) => {
    return apiClient.post('/auth/signin', formData);
  },

  register: (formData) => {
    return apiClient.post('/auth/signup', formData);
  },

  logout: () => {
    return apiClient.delete('/auth/logout');
  },

  resetPassword: (email) => {
    return apiClient.post('/auth/forgot_password', { email });
  },

  verifyToken: (accessToken) => {
    return apiClient.get(`/auth/activate/${accessToken}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  updatePassword: (passwordData) => {
    return apiClient.put('/auth/reset_password', passwordData);
  },
};