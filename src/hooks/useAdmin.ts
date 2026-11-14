import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/api/admin.service";
import { paymentService } from "@/services/api/payment.service";

// ========== Dashboard Hooks ==========
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => adminService.getDashboardStats(),
  });
};

export const usePendingApprovals = (limit: number = 10) => {
  return useQuery({
    queryKey: ["admin", "pending-approvals", limit],
    queryFn: () => adminService.getPendingApprovals(limit),
  });
};

export const useApproveVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => adminService.approveVendor(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-approvals"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useRejectVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason?: string }) =>
      adminService.rejectVendor(vendorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-approvals"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
    },
  });
};

export const useRecentReports = (limit: number = 10) => {
  return useQuery({
    queryKey: ["admin", "reports", limit],
    queryFn: () => adminService.getRecentReports(limit),
  });
};

// ========== User Management Hooks ==========
export const useUserStats = () => {
  return useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: () => adminService.getUserStats(),
  });
};

export const useAllUsers = (
  page: number = 1,
  limit: number = 20,
  search: string = "",
  status: string = "all",
  role?: string,
) => {
  return useQuery({
    queryKey: ["admin", "users", page, limit, search, status, role],
    queryFn: () => adminService.getAllUsers(page, limit, search, status, role),
  });
};

export const useUserDetails = (userId: string) => {
  return useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => adminService.getUserDetails(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        full_name?: string;
        email?: string;
        phone?: string;
        is_active?: boolean;
        role?: string;
      };
    }) => adminService.updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users", variables.userId] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      adminService.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

// ========== Vendor Management Hooks ==========
export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      full_name: string;
      phone?: string;
      business_name: string;
      bio?: string;
      service_types?: string[];
      primary_location?: string;
      service_locations?: string[];
      price_range_min?: number;
      price_range_max?: number;
      contact_number?: string;
      whatsapp_number?: string;
      website_url?: string;
      instagram_url?: string;
      facebook_url?: string;
    }) => adminService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useAllVendors = (
  page: number = 1,
  limit: number = 20,
  search: string = "",
  category: string = "all",
  status: string = "all",
) => {
  return useQuery({
    queryKey: ["admin", "vendors", page, limit, search, category, status],
    queryFn: () =>
      adminService.getAllVendors(page, limit, search, category, status),
  });
};

export const useVendorDetails = (vendorId: string) => {
  return useQuery({
    queryKey: ["admin", "vendors", vendorId],
    queryFn: () => adminService.getVendorDetails(vendorId),
    enabled: !!vendorId,
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      data,
    }: {
      vendorId: string;
      data: {
        business_name?: string;
        bio?: string;
        primary_location?: string;
        service_types?: string[];
        is_active?: boolean;
        is_verified?: boolean;
        website_url?: string;
        instagram_url?: string;
        facebook_url?: string;
        contact_number?: string;
        whatsapp_number?: string;
      };
    }) => adminService.updateVendor(vendorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors", variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ["vendors", variables.vendorId] });
    },
  });
};

export const useUpdateVendorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      isActive,
    }: {
      vendorId: string;
      isActive: boolean;
    }) => adminService.updateVendorStatus(vendorId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

export const useUpdateVendorVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      isVerified,
    }: {
      vendorId: string;
      isVerified: boolean;
    }) => adminService.updateVendorVerification(vendorId, isVerified),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-approvals"],
      });
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => adminService.deleteVendor(vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vendors"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard", "stats"],
      });
    },
  });
};

// ========== Platform Settings Hooks ==========
export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminService.getPlatformSettings(),
  });
};

export const useUpdatePlatformSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      value,
      description,
    }: {
      key: string;
      value: string;
      description?: string;
    }) => adminService.updatePlatformSetting(key, value, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
};

export const useBulkUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Record<string, string>) =>
      adminService.bulkUpdateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
};

// ========== Admin User Management Hooks ==========
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin", "admins"],
    queryFn: () => adminService.getAdminUsers(),
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      email: string;
      password: string;
      full_name: string;
      phone?: string;
    }) => adminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
};

// ========== Analytics Hooks ==========
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => paymentService.getAdminAnalytics(),
  });
};
