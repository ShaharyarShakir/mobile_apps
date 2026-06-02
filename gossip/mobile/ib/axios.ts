import { useAuth } from '@clerk/expo';
import axios from 'axios';
import { useCallback } from 'react';
import * as Sentry from '@sentry/react-native';

const API_URL = 'https://pfcr6d99-3000.inc1.devtunnels.ms/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor registered once
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      Sentry.logger.error(
        Sentry.logger
          .fmt`API request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        { status: error.response.status, endpoint: error.config?.url, method: error.config?.method }
      );
    } else if (error.request) {
      Sentry.logger.warn('API request failed - no response', {
        endpoint: error.config?.url,
        method: error.config?.method,
      });
    }
    return Promise.reject(error);
  }
);

export const useApi = () => {
  const { getToken } = useAuth();

  const apiWithAuth = useCallback(
    async <T>(config: Parameters<typeof api.request>[0]) => {
      const token = await getToken();
      return api.request<T>({
        ...config,
        headers: { ...config.headers, ...(token && { Authorization: `Bearer ${token}` }) },
      });
    },
    [getToken]
  );

  return { api, apiWithAuth };
};
