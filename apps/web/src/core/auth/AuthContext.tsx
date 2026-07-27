import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserPublic, ApiResponse, RegisterRequest, LoginRequest } from '@jurismind/shared-types';
import { apiClient, setAccessToken as setGlobalToken, registerTokenCallback } from '../api/apiClient';

interface AuthContextType {
  user: UserPublic | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
  setSession: (user: UserPublic, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    setGlobalToken(token);
  }, []);

  useEffect(() => {
    registerTokenCallback((token) => {
      setAccessTokenState(token);
    });
  }, []);

  const fetchCurrentUser = useCallback(async (token: string) => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: UserPublic }>>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch {
      setUser(null);
      updateAccessToken(null);
    }
  }, [updateAccessToken]);

  // Restore session on mount via refresh token cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
        if (response.data.success) {
          const newToken = response.data.data.accessToken;
          updateAccessToken(newToken);
          await fetchCurrentUser(newToken);
        }
      } catch {
        setUser(null);
        updateAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [fetchCurrentUser, updateAccessToken]);

  const login = async (credentials: LoginRequest) => {
    const response = await apiClient.post<ApiResponse<{ user: UserPublic; accessToken: string }>>(
      '/auth/login',
      credentials
    );

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    const { user: userData, accessToken: token } = response.data.data;
    setUser(userData);
    updateAccessToken(token);
  };

  const register = async (data: RegisterRequest) => {
    const response = await apiClient.post<ApiResponse<{ user: UserPublic; accessToken: string }>>(
      '/auth/register',
      data
    );

    if (!response.data.success) {
      throw new Error(response.data.error.message);
    }

    const { user: userData, accessToken: token } = response.data.data;
    setUser(userData);
    updateAccessToken(token);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      updateAccessToken(null);
    }
  };

  const loginWithGoogle = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${baseUrl}/auth/google`;
  };

  const setSession = (userData: UserPublic, token: string) => {
    setUser(userData);
    updateAccessToken(token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
        loginWithGoogle,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
