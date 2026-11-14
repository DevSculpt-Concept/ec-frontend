// Helper function to get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");
};

// Helper function to get refresh token from localStorage
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

// Helper function to set refresh token
export const setRefreshToken = (token: string): void => {
  localStorage.setItem("refresh_token", token);
};

// Helper function to remove refresh token
export const removeRefreshToken = (): void => {
  localStorage.removeItem("refresh_token");
};
