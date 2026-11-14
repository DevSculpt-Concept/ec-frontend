import { createSlice } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  profileImageUrl?: string;
  phone?: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

interface SetUserPayload {
  user: User;
  token: string;
}

interface SetUserPayload {
  user: User;
  token: string;
}

// Load initial state from localStorage
const loadInitialState = (): UserState => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return {
      user: null,
      isAuthenticated: false,
      token: null,
    };
  }

  try {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("user_data");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        user,
        isAuthenticated: true,
        token,
      };
    }
  } catch (error) {
    // Failed to load user state
  }

  return {
    user: null,
    isAuthenticated: false,
    token: null,
  };
};

const initialState: UserState = loadInitialState();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: { payload: SetUserPayload }) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.token = action.payload.token;

      // Persist to localStorage
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem("user_data", JSON.stringify(action.payload.user));
    },
    updateUser: (state, action: { payload: Partial<User> }) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user_data", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;

      // Clear localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
  },
});

export const { setUser, updateUser, logout, clearUser } = userSlice.actions;
export default userSlice.reducer;
