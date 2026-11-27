import { create } from 'zustand';

interface User {
  id: string;
  userName: string;
  fullName: string;
  email: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  updateToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  updateToken: (accessToken) => set({ accessToken }),
}));

export const getAccessToken = () => useAuthStore.getState().accessToken;
export const getUser = () => useAuthStore.getState().user;
export const setAuth = (user: User, accessToken: string) => useAuthStore.getState().setAuth(user, accessToken);
export const clearAuth = () => useAuthStore.getState().clearAuth();
export const hasRole = (role: string) => useAuthStore.getState().user?.role === role;
