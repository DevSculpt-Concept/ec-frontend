import { http } from "@/lib/http";
export interface SearchFilters {
  query?: string;
  serviceTypes?: string | string[];
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: "rating" | "reviews" | "price-low" | "price-high" | "featured";
  page?: number;
  limit?: number;
  availabilityDate?: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  serviceTypes: string[];
  bio?: string;
  primaryLocation: string;
  serviceLocations: string[];
  priceRange: { min: number; max: number };
  rating: { average: number; totalReviews: number };
  totalBookings: number;
  isVerified: boolean;
  profileImageUrl?: string;
  contactInfo: { whatsapp?: string; phone?: string };
}

export interface SearchResponse {
  status: string;
  message: string;
  data: {
    vendors: Vendor[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalResults: number;
      resultsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      serviceTypes?: string[];
      location?: string;
      priceRange?: { min?: string; max?: string };
      minRating?: string;
      sortBy?: string;
    };
  };
}

export interface VendorDetails {
  id: string;
  businessName: string;
  serviceTypes: string[];
  bio?: string;
  location: { primary: string; serviceAreas: string[] };
  contact: { whatsapp?: string; phone?: string; email?: string };
  social: { website?: string; instagram?: string; facebook?: string };
  stats: {
    averageRating: number;
    totalReviews: number;
    totalBookings: number;
    yearsOfExperience: number;
  };
  priceRange: { min: number; max: number };
  isVerified: boolean;
  profileImageUrl?: string;
  fullName?: string;
  pricing: unknown[];
  portfolio: unknown[];
  recentReviews: unknown[];
  // Backward-compat
  rating?: { average?: number; totalReviews?: number };
  totalBookings?: number;
  primaryLocation?: string;
}

export const searchService = {
  async searchVendors(filters: SearchFilters = {}): Promise<SearchResponse> {
    const { query, serviceTypes, location, priceMin, priceMax, rating, sortBy = "rating", page = 1, limit = 10 } = filters;
    const res = await http.get<SearchResponse["data"]>(
      "/vendors",
      {
        query,
        serviceTypes: Array.isArray(serviceTypes) ? serviceTypes.join(",") : serviceTypes,
        location,
        priceMin,
        priceMax,
        rating,
        sortBy,
        page,
        limit,
      },
      { auth: false },
    );
    return res as unknown as SearchResponse;
  },

  async getVendorDetails(vendorId: string): Promise<{ status: string; message: string; data: VendorDetails }> {
    const res = await http.get<VendorDetails>(`/vendors/${vendorId}`);
    return res as { status: string; message: string; data: VendorDetails };
  },

  async checkVendorAvailability(
    vendorId: string,
    date: string,
    _startTime?: string,
    _endTime?: string,
  ): Promise<{ status: string; message: string; data: { vendorId: string; date: string; isAvailable: boolean } }> {
    void _startTime; void _endTime;
    const res = await http.get<{ vendorId: string; date: string; isAvailable: boolean }>(`/vendors/${vendorId}/availability`, { date }, { auth: false });
    return res as { status: string; message: string; data: { vendorId: string; date: string; isAvailable: boolean } };
  },

  async getFilterOptions(): Promise<{ status: string; message: string; data: unknown }> {
    return http.get("/vendors/filter-options", undefined, { auth: false });
  },
};
