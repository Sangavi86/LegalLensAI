import axios from 'axios';
import type { ApiResponse } from '@jurismind/shared-types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessTokenInMemory: string | null = null;
let setAccessTokenCallback: ((token: string | null) => void) | null = null;

export function setAccessToken(token: string | null): void {
  accessTokenInMemory = token;
  if (setAccessTokenCallback) {
    setAccessTokenCallback(token);
  }
}

export function getAccessToken(): string | null {
  return accessTokenInMemory;
}

export function registerTokenCallback(cb: (token: string | null) => void): void {
  setAccessTokenCallback = cb;
}

// Attach access token to requests if available
apiClient.interceptors.request.use((config) => {
  if (accessTokenInMemory && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessTokenInMemory}`;
  }
  return config;
});

// Auto refresh token on 401 error
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          const newToken = refreshResponse.data.data.accessToken;
          setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);
