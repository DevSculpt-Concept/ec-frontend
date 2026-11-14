import { http } from "@/lib/http";
export interface VendorWallet {
  id: string;
  vendor_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorBalance {
  available: number;
  pending: number;
  totalEarnings: number;
  totalWithdrawn: number;
}

export interface WithdrawalRequest {
  id: string;
  vendor_id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "processing" | "completed" | "failed";
  wallet_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  admin_id?: string;
  admin_note?: string;
  processed_at?: string;
  reference: string;
  created_at: string;
  updated_at: string;
  vendor_profiles?: { id: string; business_name: string; users?: { full_name: string; email: string } };
}

export interface EarningsEntry {
  id: string;
  booking_id: string;
  vendor_id: string;
  gross_amount: number;
  platform_fee: number;
  platform_fee_percentage: number;
  vendor_amount: number;
  status: string;
  created_at: string;
  bookings?: { id: string; booking_reference: string; event_title: string; users?: { full_name: string } };
}

export interface Transaction {
  id: string;
  booking_id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  paystack_reference: string;
  paystack_status: string;
  status: string;
  created_at: string;
  bookings?: { booking_reference: string; event_title: string; vendor_profiles?: { business_name: string } };
  users?: { full_name: string; email: string };
}

export interface PlatformRevenue {
  totals: { platformFee: number; vendorAmount: number; grossAmount: number };
  recentRevenue: unknown[];
  monthlyData: Record<string, number>;
  transactionCount: number;
}

export interface AdminAnalytics {
  overview: {
    totalUsers: number;
    newUsersThisMonth: number;
    totalVendors: number;
    activeVendors: number;
    totalBookings: number;
    bookingsThisMonth: number;
    bookingGrowth: number;
    totalPlatformRevenue: number;
    totalGrossRevenue: number;
    platformRevenueThisMonth: number;
  };
  distributions: { bookingStatus: Record<string, number>; paymentStatus: Record<string, number>; serviceType: Record<string, number> };
  topVendors: Array<{ name: string; bookings: number }>;
  monthlyRevenueTrend: Record<string, { platformFee: number; grossAmount: number }>;
}

interface ApiResponse<T> { status: string; message?: string; data: T; }

type Paged = { pagination: unknown };

export const paymentService = {
  getVendorWallet: async (): Promise<ApiResponse<{ wallet: VendorWallet | null }>> =>
    http.get<{ wallet: VendorWallet | null }>("/payments/wallet"),

  saveVendorWallet: async (walletData: { accountName: string; accountNumber: string; bankName: string; bankCode?: string }): Promise<ApiResponse<{ wallet: VendorWallet }>> =>
    http.put<{ wallet: VendorWallet }>("/payments/wallet", walletData),

  getVendorBalance: async (): Promise<ApiResponse<{ balance: VendorBalance; platformFeePercentage?: number; minimumWithdrawal?: number; pendingWithdrawals?: number }>> =>
    http.get("/payments/balance"),

  requestWithdrawal: async (amount: number): Promise<ApiResponse<{ withdrawal: WithdrawalRequest }>> =>
    http.post<{ withdrawal: WithdrawalRequest }>("/payments/withdrawals", { amount }),

  getWithdrawalHistory: async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ withdrawals: WithdrawalRequest[]; pagination: unknown }>> =>
    http.get<{ withdrawals: WithdrawalRequest[] } & Paged>("/payments/withdrawals", { page, limit, status }),

  getEarningsHistory: async (page = 1, limit = 20): Promise<ApiResponse<{ earnings: EarningsEntry[]; pagination: unknown }>> =>
    http.get<{ earnings: EarningsEntry[] } & Paged>("/payments/earnings", { page, limit }),

  // Admin services
  getAllWithdrawals: async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ withdrawals: WithdrawalRequest[]; pagination: unknown }>> =>
    http.get<{ withdrawals: WithdrawalRequest[] } & Paged>("/admin/payments/withdrawals", { page, limit, status }),

  /** approve → reject → complete (after the bank transfer has been sent) */
  processWithdrawal: async (withdrawalId: string, action: "approve" | "reject" | "complete", note?: string): Promise<ApiResponse<{ withdrawal: WithdrawalRequest }>> =>
    http.patch<{ withdrawal: WithdrawalRequest }>(`/admin/payments/withdrawals/${withdrawalId}`, { action, note }),

  getPlatformRevenue: async (_startDate?: string, _endDate?: string): Promise<ApiResponse<PlatformRevenue>> => {
    void _startDate; void _endDate;
    return http.get<PlatformRevenue>("/admin/payments/revenue");
  },

  getAllTransactions: async (page = 1, limit = 20, type?: string, status?: string): Promise<ApiResponse<{ transactions: Transaction[]; stats: unknown; pagination: unknown }>> =>
    http.get<{ transactions: Transaction[]; stats: unknown } & Paged>("/admin/payments/transactions", { page, limit, type, status }),

  getAdminAnalytics: async (): Promise<ApiResponse<AdminAnalytics>> =>
    http.get<AdminAnalytics>("/admin/analytics"),
};

export default paymentService;
