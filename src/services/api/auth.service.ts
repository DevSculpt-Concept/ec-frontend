import { http } from "@/lib/http";
import { getRefreshToken } from "@/config/api";

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "user" | "vendor";
  phoneNumber?: string;
  businessName?: string;
  primaryLocation?: string;
  serviceTypes?: string[];
  serviceLocations?: string[];
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  vendorProfile?: Record<string, unknown>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: AuthUser;
    session: AuthSession;
  };
}

export interface ApiError {
  status: string;
  message: string;
  errors?: string[];
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await http.post<AuthResponse["data"]>("/auth/register", data, { auth: false });
    return res as unknown as AuthResponse;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await http.post<AuthResponse["data"]>("/auth/login", data, { auth: false });
    return res as unknown as AuthResponse;
  },

  /** Restore the signed-in user from the stored access token. */
  async me(): Promise<{ user: AuthUser }> {
    const res = await http.get<{ user: AuthUser }>("/auth/me");
    return res.data;
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    try {
      await http.post("/auth/logout", { refreshToken }, { auth: false });
    } catch {
      /* logging out locally is enough */
    }
  },

  async forgotPassword(email: string): Promise<{ status: string; message: string }> {
    const res = await http.post("/auth/forgot-password", { email }, { auth: false });
    return { status: res.status, message: res.message || "Reset email sent. Please check your inbox." };
  },

  async resetPassword(password: string, token: string): Promise<{ status: string; message: string }> {
    const res = await http.post("/auth/reset-password", { token, password }, { auth: false });
    return { status: res.status, message: res.message || "Password reset successful" };
  },

  async verifyEmail(token: string, _type: string = "signup"): Promise<{ status: string; message: string }> {
    void _type;
    const res = await http.post("/auth/verify-email", { token }, { auth: false });
    return { status: res.status, message: res.message || "Email verified successfully! You can now log in." };
  },

  async resendConfirmation(email: string): Promise<{ status: string; message: string }> {
    const res = await http.post("/auth/resend-confirmation", { email }, { auth: false });
    return { status: res.status, message: res.message || "Confirmation email sent. Please check your inbox." };
  },
};
