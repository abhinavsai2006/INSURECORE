import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT" | "CUSTOMER";
  token?: string;
  customerId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Default user for demo purposes
const defaultUser: User = {
  id: "1",
  name: "John Doe",
  email: "admin@insurecore.com",
  role: "ADMIN",
  token: "demo-token",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),
    {
      name: "auth-storage",
    }
  )
);

// Helper functions
export const isAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
};

export const getCurrentUser = (): User | null => {
  return useAuthStore.getState().user;
};

export const getUserRole = (): "ADMIN" | "AGENT" | "CUSTOMER" | null => {
  return useAuthStore.getState().user?.role ?? null;
};

export const isAdmin = (): boolean => {
  return getUserRole() === "ADMIN";
};

export const isAgent = (): boolean => {
  return getUserRole() === "AGENT";
};

export const isCustomer = (): boolean => {
  return getUserRole() === "CUSTOMER";
};