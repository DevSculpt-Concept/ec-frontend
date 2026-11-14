/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/lib/http";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  profile_image_url?: string;
  created_at: string;
  is_active?: boolean;
  vendor_profiles?: {
    id: string;
    business_name: string;
    service_types: string[];
    primary_location: string;
    is_verified: boolean;
    is_active: boolean;
    average_rating: number;
    total_reviews: number;
    created_at: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  totalBookings: number;
  pendingApprovals: number;
  platformRevenue: number;
  activeVendors: number;
  newUsersThisMonth: number;
  newVendorsThisMonth: number;
  usersGrowth: string;
  vendorsGrowth: string;
}

export interface PendingApproval {
  id: string;
  business_name: string;
  service_types: string[];
  primary_location: string;
  created_at: string;
  users?: { full_name: string; email: string };
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  description?: string;
  category: string;
  is_public: boolean;
  updated_at: string;
}

interface ApiResponse<T> { status: string; message: string; data: T; }

export const adminService = {
  // ── Dashboard ──────────────────────────────────────────────
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> =>
    http.get<DashboardStats>("/admin/dashboard/stats") as Promise<ApiResponse<DashboardStats>>,

  // ── Users ──────────────────────────────────────────────────
  getAllUsers: async (page = 1, limit = 20, search = "", status = "all", role = "all"): Promise<ApiResponse<{ users: any[]; pagination: any }>> =>
    http.get<{ users: any[]; pagination: any }>("/admin/users", { page, limit, search: search.trim(), status, role }) as Promise<ApiResponse<{ users: any[]; pagination: any }>>,

  getUserDetails: async (userId: string): Promise<ApiResponse<{ user: any }>> =>
    http.get<{ user: any }>(`/admin/users/${userId}`) as Promise<ApiResponse<{ user: any }>>,

  updateUser: async (userId: string, updates: Record<string, unknown>): Promise<ApiResponse<{ user: any }>> =>
    http.patch<{ user: any }>(`/admin/users/${userId}`, updates) as Promise<ApiResponse<{ user: any }>>,

  updateUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<{ user: any }>> =>
    http.patch<{ user: any }>(`/admin/users/${userId}/status`, { isActive }) as Promise<ApiResponse<{ user: any }>>,

  suspendUser: async (userId: string, reason?: string): Promise<ApiResponse<{ user: AdminUser }>> =>
    http.post<{ user: AdminUser }>(`/admin/users/${userId}/suspend`, { reason }) as Promise<ApiResponse<{ user: AdminUser }>>,

  activateUser: async (userId: string): Promise<ApiResponse<{ user: AdminUser }>> =>
    http.post<{ user: AdminUser }>(`/admin/users/${userId}/activate`) as Promise<ApiResponse<{ user: AdminUser }>>,

  deleteUser: async (userId: string): Promise<ApiResponse<null>> =>
    http.delete<null>(`/admin/users/${userId}`) as Promise<ApiResponse<null>>,

  // ── Vendors ─────────────────────────────────────────────────
  getAllVendors: async (page = 1, limit = 20, search?: string, category?: string, status?: string): Promise<ApiResponse<{ vendors: any[]; pagination: any }>> =>
    http.get<{ vendors: any[]; pagination: any }>("/admin/vendors", { page, limit, search, category, status }) as Promise<ApiResponse<{ vendors: any[]; pagination: any }>>,

  getVendorDetails: async (vendorId: string): Promise<ApiResponse<{ vendor: any; reviews: any[] }>> =>
    http.get<{ vendor: any; reviews: any[] }>(`/admin/vendors/${vendorId}`) as Promise<ApiResponse<{ vendor: any; reviews: any[] }>>,

  updateVendor: async (vendorId: string, updates: any): Promise<ApiResponse<{ vendor: any }>> =>
    http.patch<{ vendor: any }>(`/admin/vendors/${vendorId}`, updates) as Promise<ApiResponse<{ vendor: any }>>,

  updateVendorStatus: async (vendorId: string, isActive: boolean): Promise<ApiResponse<{ vendor: any }>> =>
    http.patch<{ vendor: any }>(`/admin/vendors/${vendorId}/status`, { isActive }) as Promise<ApiResponse<{ vendor: any }>>,

  updateVendorVerification: async (vendorId: string, isVerified: boolean): Promise<ApiResponse<{ vendor: any }>> =>
    http.patch<{ vendor: any }>(`/admin/vendors/${vendorId}/verification`, { isVerified }) as Promise<ApiResponse<{ vendor: any }>>,

  createVendor: async (data: any): Promise<ApiResponse<{ vendor: any }>> =>
    http.post<{ vendor: any }>("/admin/vendors", data) as Promise<ApiResponse<{ vendor: any }>>,

  getPendingApprovals: async (limit: number = 10): Promise<ApiResponse<{ approvals: any[]; total: number }>> =>
    http.get<{ approvals: any[]; total: number }>("/admin/vendors/pending", { limit }) as Promise<ApiResponse<{ approvals: any[]; total: number }>>,

  approveVendor: async (vendorId: string): Promise<ApiResponse<{ vendor: unknown }>> =>
    http.post<{ vendor: unknown }>(`/admin/vendors/${vendorId}/approve`) as Promise<ApiResponse<{ vendor: unknown }>>,

  rejectVendor: async (vendorId: string, reason?: string): Promise<ApiResponse<{ vendor: unknown }>> =>
    http.post<{ vendor: unknown }>(`/admin/vendors/${vendorId}/reject`, { reason }) as Promise<ApiResponse<{ vendor: unknown }>>,

  suspendVendor: async (vendorId: string, reason?: string): Promise<ApiResponse<{ vendor: unknown }>> =>
    http.post<{ vendor: unknown }>(`/admin/vendors/${vendorId}/suspend`, { reason }) as Promise<ApiResponse<{ vendor: unknown }>>,

  activateVendor: async (vendorId: string): Promise<ApiResponse<{ vendor: unknown }>> =>
    http.post<{ vendor: unknown }>(`/admin/vendors/${vendorId}/activate`) as Promise<ApiResponse<{ vendor: unknown }>>,

  deleteVendor: async (vendorProfileId: string): Promise<ApiResponse<null>> =>
    http.delete<null>(`/admin/vendors/${vendorProfileId}`) as Promise<ApiResponse<null>>,

  // ── Bookings ─────────────────────────────────────────────────
  getAllBookings: async (page = 1, limit = 20, status?: string, search?: string): Promise<ApiResponse<{ bookings: unknown[]; pagination: unknown }>> =>
    http.get<{ bookings: unknown[]; pagination: unknown }>("/admin/bookings", { page, limit, status, search }) as Promise<ApiResponse<{ bookings: unknown[]; pagination: unknown }>>,

  getBookingDetails: async (bookingId: string): Promise<ApiResponse<{ booking: unknown }>> =>
    http.get<{ booking: unknown }>(`/admin/bookings/${bookingId}`) as Promise<ApiResponse<{ booking: unknown }>>,

  updateBookingStatus: async (bookingId: string, status: string, paymentStatus?: string): Promise<ApiResponse<{ booking: unknown }>> =>
    http.patch<{ booking: unknown }>(`/admin/bookings/${bookingId}/status`, { status: status || undefined, paymentStatus }) as Promise<ApiResponse<{ booking: unknown }>>,

  // ── Platform Settings ─────────────────────────────────────────
  getPlatformSettings: async (): Promise<ApiResponse<{ settings: PlatformSetting[] }>> =>
    http.get<{ settings: PlatformSetting[] }>("/admin/settings") as Promise<ApiResponse<{ settings: PlatformSetting[] }>>,

  updatePlatformSetting: async (key: string, value: unknown, description?: string): Promise<ApiResponse<{ setting: PlatformSetting }>> =>
    http.patch<{ setting: PlatformSetting }>(`/admin/settings/${encodeURIComponent(key)}`, { value, description }) as Promise<ApiResponse<{ setting: PlatformSetting }>>,

  bulkUpdateSettings: async (settings: Record<string, string>): Promise<ApiResponse<null>> =>
    http.put<null>("/admin/settings", { settings }) as Promise<ApiResponse<null>>,

  getAdminUsers: async (): Promise<ApiResponse<{ admins: any[] }>> =>
    http.get<{ admins: any[] }>("/admin/admins") as Promise<ApiResponse<{ admins: any[] }>>,

  // ── Admin Creation ────────────────────────────────────────────
  createAdmin: async (data: any): Promise<ApiResponse<{ user: AdminUser }>> =>
    http.post<{ user: AdminUser }>("/admin/admins", data) as Promise<ApiResponse<{ user: AdminUser }>>,

  getRecentReports: async (limit: number = 10) => {
    // Reports are support tickets
    const { supportService } = await import("./support.service");
    return supportService.getAllTickets(undefined, undefined, undefined, 1, limit);
  },

  getUserStats: async () => {
    const res = await http.get<{
      totalUsers: number;
      totalUsersGrowth: string;
      activeUsers: number;
      newUsersToday: number;
      suspendedUsers: number;
      customers: number;
      vendors: number;
      admins: number;
    }>("/admin/users/stats");
    return { status: res.status, data: res.data };
  },
};

export default adminService;
