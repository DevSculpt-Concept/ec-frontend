import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  authService,
  type LoginData,
  type RegisterData,
} from "@/services/api/auth.service";
import { useAppDispatch } from "@/store/redux/hooks";
import { setUser, logout as logoutAction } from "@/store/redux/userSlice";
import {
  setAuthToken,
  removeAuthToken,
  setRefreshToken,
  removeRefreshToken,
} from "@/config/api";
import { showToast } from "@/lib/toast";
import { toUiRole } from "@/components/auth/AuthSessionListener";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: LoginData) => authService.login(data),
    onSuccess: (response) => {
      const user = response.data.user;
      const token = response.data.session?.accessToken;
      const refreshToken = response.data.session?.refreshToken;

      // Store tokens
      if (token) {
        setAuthToken(token);
      }

      if (refreshToken) {
        setRefreshToken(refreshToken);
      }

      // Dispatch to Redux
      dispatch(
        setUser({
          user: {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: toUiRole(user.role),
            profileImageUrl: user.profileImage,
            phone: user.phone,
          },
          token: token || "",
        }),
      );

      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Show success toast
      showToast.success(
        `Welcome back, ${user.fullName || user.email}!`,
        "Login successful",
      );

      // Navigate based on role
      if (user.role === "vendor") {
        navigate("/vendor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/search");
      }
    },
    onError: (error: Error) => {
      showToast.error(
        "Login failed",
        error.message || "Please check your credentials and try again",
      );
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Show success toast
      const userName =
        response.data?.user?.fullName || response.data?.user?.email || "User";
      showToast.success(
        `Account created successfully!`,
        `Welcome to The Curry Fabulous Family, ${userName}! Please check your email to verify your account.`,
      );
    },
    onError: (error: Error) => {
      showToast.error(
        "Registration failed",
        error.message || "Please try again",
      );
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      removeAuthToken();
      removeRefreshToken();
      dispatch(logoutAction());
      queryClient.clear();
      showToast.success(
        "Logged out successfully",
        "You have been logged out. See you soon!",
      );
      navigate("/");
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      removeAuthToken();
      removeRefreshToken();
      dispatch(logoutAction());
      queryClient.clear();
      showToast.success(
        "Logged out successfully",
        "You have been logged out. See you soon!",
      );
      navigate("/");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ password, token }: { password: string; token: string }) =>
      authService.resetPassword(password, token),
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: ({ token, type }: { token: string; type?: string }) =>
      authService.verifyEmail(token, type),
  });
};

export const useResendConfirmation = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendConfirmation(email),
  });
};
