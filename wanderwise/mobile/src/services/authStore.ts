import { create } from "zustand";
import { api, tokenStorage } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isRestoring: boolean;

  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isRestoring: true,

  register: async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const { user, token } = response.data;

      await tokenStorage.setToken(token);
      set({ user, token });
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Registration failed. Please try again.";
      throw new Error(message);
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      const { token } = response.data;

      // Save token first so the interceptor picks it up
      await tokenStorage.setToken(token);
      set({ token });

      // Fetch user profile using GET /auth/me
      const userResponse = await api.get("/auth/me");
      set({ user: userResponse.data });
    } catch (error: any) {
      await tokenStorage.removeToken();
      set({ user: null, token: null });
      const message =
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please check your credentials.";
      throw new Error(message);
    }
  },

  logout: async () => {
    await tokenStorage.removeToken();
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    try {
      set({ isRestoring: true });
      const token = await tokenStorage.getToken();
      if (token) {
        set({ token });
        // Retrieve profile details to verify token validity
        const userResponse = await api.get("/auth/me");
        set({ user: userResponse.data });
      } else {
        set({ user: null, token: null });
      }
    } catch {
      await tokenStorage.removeToken();
      set({ user: null, token: null });
    } finally {
      set({ isRestoring: false });
    }
  },
}));
