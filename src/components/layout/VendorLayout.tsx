import { DashboardLayout, type NavItem } from "@/components/layout/DashboardLayout";
import {
  HeadphonesIcon,
  LayoutGrid,
  User,
} from "lucide-react";
import { Outlet } from "react-router-dom";

export const vendorNavItems: NavItem[] = [
  { path: "/vendor/dashboard", label: "Overview", icon: LayoutGrid },
  { path: "/vendor/dashboard/profile", label: "Profile Management", icon: User },
  // { path: "/vendor/dashboard/notifications", label: "Notifications", icon: Bell },
  {
    path: "/vendor/dashboard/support",
    label: "Support/ Help Centre",
    icon: HeadphonesIcon,
  },
];

interface VendorLayoutProps {
  children?: React.ReactNode;
}

// Wrapper component for individual pages that still need it
export function VendorLayout({ children }: VendorLayoutProps) {
  return (
    <DashboardLayout title="Vendor Dashboard" navItems={vendorNavItems}>
      {children}
    </DashboardLayout>
  );
}

// Layout component for Outlet-based routing
export function VendorDashboardLayout() {
  return (
    <DashboardLayout title="Vendor Dashboard" navItems={vendorNavItems}>
      <Outlet />
    </DashboardLayout>
  );
}

