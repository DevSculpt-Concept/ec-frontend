import { Route, Routes } from "react-router-dom";
import { ContactPage } from "@/pages/ContactPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SearchPage } from "@/pages/SearchPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { SignupPage } from "@/pages/SignupPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { VendorProfilePage } from "@/pages/VendorProfilePage";
import { UserProfilePage } from "@/pages/UserProfilePage";
import { PortfolioDetailPage } from "@/pages/PortfolioDetailPage";
import { AllPortfoliosPage } from "@/pages/AllPortfoliosPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { UserSupport } from "@/pages/user/UserSupport";
import { UserTicketDetails } from "@/pages/user/UserTicketDetails";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { SettingsPage } from "@/pages/admin/SettingsPage";
import { UserManagement } from "@/pages/admin/UserManagement";
import { VendorManagement } from "@/pages/admin/VendorManagement";
import { ReportsPage } from "@/pages/admin/ReportsPage";
import { AnalyticsPage } from "@/pages/admin/AnalyticsPage";
import { AdminTicketDetails } from "@/pages/admin/AdminTicketDetails";
import { AdminUserProfile } from "@/pages/admin/AdminUserProfile";
import { AdminUserEdit } from "@/pages/admin/AdminUserEdit";
import { AdminVendorProfile } from "@/pages/admin/AdminVendorProfile";
import { AdminVendorEdit } from "@/pages/admin/AdminVendorEdit";
import { ServiceTypesPage } from "@/pages/admin/ServiceTypesPage";
import { NotificationsPage } from "@/pages/admin/NotificationsPage";
import { VendorDashboard } from "@/pages/vendor/VendorDashboard";
import { VendorNotifications } from "@/pages/vendor/VendorNotifications";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layout component for public routes
const PublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
          <Route path="/vendor/:vendorId/portfolio" element={<AllPortfoliosPage />} />
          <Route path="/portfolio/:portfolioId" element={<PortfolioDetailPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/support" element={<UserSupport />} />
          <Route path="/support/tickets/:ticketId" element={<UserTicketDetails />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          {/* 404 Catch-all route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin Routes (no navbar/footer) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="vendors" element={<VendorManagement />} />
              <Route path="vendors/:vendorId" element={<AdminVendorProfile />} />
              <Route path="vendors/:vendorId/edit" element={<AdminVendorEdit />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="users/:userId" element={<AdminUserProfile />} />
              <Route path="users/:userId/edit" element={<AdminUserEdit />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/ticket/:ticketId" element={<AdminTicketDetails />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="service-types" element={<ServiceTypesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      {/* Vendor Notifications (outside VendorDashboard for direct access) */}
      <Route path="/vendor/dashboard/notifications" element={<ProtectedRoute requiredRole="vendor"><VendorNotifications /></ProtectedRoute>} />

      {/* Vendor Dashboard Routes (no navbar/footer) - must come before /vendor/:vendorId */}
      <Route
        path="/vendor/dashboard/*"
        element={
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Public Routes (with navbar/footer) */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
};
