import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  isSuperuser: boolean;
}

interface AppState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  theme: 'light' | 'dark';
  isInitialized: boolean;
  setAuth: (
    accessToken: string | null,
    refreshToken: string | null,
    user: User | null,
  ) => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  theme: 'dark', // Default to dark for premium tech aesthetic
  isInitialized: false,
  setAuth: async (accessToken, refreshToken, user) => {
    try {
      if (accessToken && refreshToken) {
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        if (user) {
          await SecureStore.setItemAsync('user', JSON.stringify(user));
        }
      } else {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
      }
    } catch (e) {
      console.error('Error saving credentials securely', e);
    }
    set({ accessToken, refreshToken, user });
  },
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
    } catch (e) {
      console.error('Error clearing secure storage on logout', e);
    }
    set({ user: null, accessToken: null, refreshToken: null });
  },
  initializeAuth: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const userStr = await SecureStore.getItemAsync('user');
      const user = userStr ? JSON.parse(userStr) : null;
      set({ accessToken, refreshToken, user, isInitialized: true });
    } catch (e) {
      console.error('Failed to initialize auth store from secure storage', e);
      set({ isInitialized: true });
    }
  },
}));

export default useAppStore;
