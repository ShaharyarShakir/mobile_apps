import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

// Load base API URL from Expo environment configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout limit
});

// Request interceptor to dynamically inject headers
apiClient.interceptors.request.use(
  async (config) => {
    const token = useAppStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally and perform automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAppStore.getState().refreshToken;

      if (refreshToken) {
        try {
          // Perform refresh token endpoint call using regular axios to avoid infinite loops
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          // Check if response is formatted in StandardResponse envelope
          const responseData = response.data;
          // In our backend, endpoints return either raw TokenResponse or wrapped StandardResponse depending on how the route is configured.
          // Since our auth endpoints return TokenResponse directly:
          const { access_token, refresh_token, user } = responseData;

          // Update store (which saves them securely in expo-secure-store)
          await useAppStore.getState().setAuth(access_token, refresh_token, user);

          // Update header and retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('[API Client] Refresh token rotation failed:', refreshError);
          // Revoke session and log out
          await useAppStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available, logout immediately
        await useAppStore.getState().logout();
      }
    }

    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };

    console.error('[API Client Error Interceptor]', errorDetails);
    return Promise.reject(error);
  },
);

export default apiClient;
