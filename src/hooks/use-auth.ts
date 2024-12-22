import { useState, useCallback } from 'react';
import { apiClient } from 'src/utils/api-client';

interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

const TOKEN_KEY = 'auth_token';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.fetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password }),
      });
      
      if (response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return { success: false, message: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const logout = useCallback(() => localStorage.removeItem(TOKEN_KEY), []);

  return {
    login,
    logout,
    getToken,
    isLoading,
    error,
  };
} 