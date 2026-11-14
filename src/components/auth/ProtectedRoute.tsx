import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/redux/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "vendor" | "admin" | "user";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect based on user role
    if (user?.role === "vendor") {
      return <Navigate to="/vendor/dashboard" replace />;
    } else if (user?.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/search" replace />;
    }
  }

  return <>{children}</>;
}

