import { DashboardLayout, type NavItem } from "@/components/layout/DashboardLayout";
import {
  AlertCircle,
  LayoutGrid,
  ListChecks,
  Store,
  Users,
} from "lucide-react";
import { Outlet } from "react-router-dom";

export const adminNavItems: NavItem[] = [
  { path: "/admin", label: "Overview", icon: LayoutGrid },
  { path: "/admin/vendors", label: "Vendor Management", icon: Store },
  { path: "/admin/users", label: "User Management", icon: Users },
  { path: "/admin/service-types", label: "Service Types", icon: ListChecks },
  // { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/reports", label: "Reports & Issues", icon: AlertCircle },
  // { path: "/admin/analytics", label: "Platform Analysis", icon: BarChart3 },
  // { path: "/admin/settings", label: "System Setting", icon: Settings },
];

export function AdminLayout() {
  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <Outlet />
    </DashboardLayout>
  );
}

