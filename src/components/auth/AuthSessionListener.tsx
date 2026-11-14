import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { authService } from "@/services/api/auth.service";
import { setUser, logout } from "@/store/redux/userSlice";
import { getAuthToken, getRefreshToken, removeAuthToken } from "@/config/api";
import { AUTH_LOGOUT_EVENT } from "@/lib/http";

/** Backend stores customers with role "user"; the UI calls them "customer". */
export const toUiRole = (role: string): "customer" | "vendor" | "admin" =>
  role === "vendor" || role === "admin" ? role : "customer";

/**
 * Restores the signed-in user on page load (GET /auth/me) and signs the UI out
 * when the HTTP client reports that the session can no longer be refreshed.
 */
export function AuthSessionListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!getAuthToken() && !getRefreshToken()) return;
      try {
        const { user } = await authService.me(); // transparently refreshes an expired token
        if (cancelled) return;
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
            token: getAuthToken() || "",
          }),
        );
      } catch (err) {
        // Only drop the session for auth failures, not for a temporary network error.
        if ((err as { status?: number })?.status === 401) {
          removeAuthToken();
          dispatch(logout());
        }
      }
    };

    const onForcedLogout = () => dispatch(logout());

    restore();
    window.addEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_LOGOUT_EVENT, onForcedLogout);
    };
  }, [dispatch]);

  return null;
}
