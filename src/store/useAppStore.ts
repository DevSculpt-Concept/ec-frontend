import { create } from "zustand";

interface SearchFilters {
  eventType: string;
  serviceType: string;
  location: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor";
}

interface AppState {
  // Search filters
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetSearchFilters: () => void;

  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const initialSearchFilters: SearchFilters = {
  eventType: "",
  serviceType: "",
  location: "",
};

export const useAppStore = create<AppState>((set) => ({
  // Search filters
  searchFilters: initialSearchFilters,
  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),
  resetSearchFilters: () => set({ searchFilters: initialSearchFilters }),

  // User state
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
