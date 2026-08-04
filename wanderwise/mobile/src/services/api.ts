import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Retrieve the base URL dynamically based on environment
const getBaseURL = () => {
  if (Platform.OS === "web") {
    return "/api";
  }

  // For native mobile simulators/devices in development, use host IP address of Expo server
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8081/api`;
  }

  // Fallback
  return "http://localhost:8081/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper for platform-specific secure storage
export const tokenStorage = {
  async setToken(token: string) {
    if (Platform.OS === "web") {
      localStorage.setItem("access_token", token);
    } else {
      await SecureStore.setItemAsync("access_token", token);
    }
  },
  async getToken(): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem("access_token");
    } else {
      try {
        return await SecureStore.getItemAsync("access_token");
      } catch {
        return null;
      }
    }
  },
  async removeToken() {
    if (Platform.OS === "web") {
      localStorage.removeItem("access_token");
    } else {
      try {
        await SecureStore.deleteItemAsync("access_token");
      } catch {
        // Ignore errors on delete
      }
    }
  },
};

// Axios Request Interceptor to attach Authorization header
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);