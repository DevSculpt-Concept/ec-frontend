import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/redux/userSlice";
import { removeAuthToken, removeRefreshToken, getAuthToken, getRefreshToken } from "@/config/api";
import type { RootState } from "@/store/redux/store";

export function AuthLogoutHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  useEffect(() => {
    const handleLogout = () => {
      dispatch(logout());
      removeAuthToken();
      removeRefreshToken();
      navigate("/login");
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => {
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [dispatch, navigate]);

  // Check if user is authenticated but missing refresh token (needs to log in again)
  useEffect(() => {
    if (isAuthenticated) {
      const accessToken = getAuthToken();
      const refreshToken = getRefreshToken();

      if (accessToken && !refreshToken) {
        // User has access token but no refresh token - token refresh won't work
      }
    }
  }, [isAuthenticated]);

  return null;
}

