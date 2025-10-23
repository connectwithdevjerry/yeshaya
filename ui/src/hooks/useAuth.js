// src/hooks/useAuth.js
import { useSelector } from 'react-redux';

export const useAuth = () => {  
  const auth = useSelector((state) => state.auth);
  
  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
  };
};
