/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from "@/lib/http";
export interface VendorDashboardStats {
  totalBookings: { value: number; change: string; trend: "up" | "down" | "neutral" };
  events: { value: number; change: string; trend: "up" | "down" | "neutral" };
  earnings: { value: number; lastMonth: number; change: string; trend: "up" | "down" | "neutral" };
  reviews: { value: number; averageRating: string; change: string; trend: "up" | "down" | "neutral" };
}

export interface UpcomingEvent {
  id: string;
  event_type: string;
  event_date: string;
  event_location: string;
  booking_status: string;
  total_amount: number;
  users: { id: string; full_name: string; email: string; profile_image_url?: string };
}

export interface VendorDashboardResponse {
  status: string;
  message: string;
  data: { statistics: VendorDashboardStats; upcomingEvents: UpcomingEvent[] };
}

export interface VendorProfileData {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  profile_image_url?: string;
  role: string;
  created_at: string;
  vendor_profiles: {
    id: string;
    business_name: string;
    service_types: string[];
    primary_location: string;
    service_locations: string[];
    bio: string;
    whatsapp_number: string;
    contact_number: string;
    average_rating: number;
    total_reviews: number;
    years_of_experience: number;
    website_url: string;
    instagram_url: string;
    facebook_url: string;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
  };
}

export interface VendorProfileResponse {
  status: string;
  message: string;
  data: { user: VendorProfileData };
}

export interface ServicePricing {
  serviceType: string;
  price: number | null;
  pricingId: string | null;
}

export interface ServicePricingResponse {
  status: string;
  message: string;
  data: { pricing: ServicePricing[] };
}

export const vendorService = {
  async getDashboard(): Promise<VendorDashboardResponse> {
    return (await http.get<VendorDashboardResponse["data"]>("/vendors/me/dashboard")) as VendorDashboardResponse;
  },

  async getProfile(): Promise<VendorProfileResponse> {
    return (await http.get<VendorProfileResponse["data"]>("/vendors/me/profile")) as VendorProfileResponse;
  },

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    businessName?: string;
    bio?: string;
    primaryLocation?: string;
    serviceTypes?: string[];
    serviceLocations?: string[];
    whatsappNumber?: string;
    contactNumber?: string;
    yearsOfExperience?: number;
    websiteUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
  }): Promise<VendorProfileResponse> {
    return (await http.patch<VendorProfileResponse["data"]>("/vendors/me/profile", data)) as VendorProfileResponse;
  },

  async getServicePricing(): Promise<ServicePricingResponse> {
    return (await http.get<ServicePricingResponse["data"]>("/vendors/me/pricing")) as ServicePricingResponse;
  },

  async updateServicePricing(serviceType: string, price: number): Promise<{ status: string; message: string; data: { pricing: any } }> {
    return (await http.put<{ pricing: any }>("/vendors/me/pricing", { serviceType, price })) as any;
  },

  async getBookings(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    return http.get("/vendors/me/bookings", { status, page, limit });
  },

  async acceptBooking(bookingId: string): Promise<any> {
    return http.patch(`/vendors/me/bookings/${bookingId}/accept`);
  },

  async completeBooking(bookingId: string): Promise<any> {
    return http.patch(`/vendors/me/bookings/${bookingId}/complete`);
  },

  async rejectBooking(bookingId: string, reason?: string): Promise<any> {
    return http.patch(`/vendors/me/bookings/${bookingId}/reject`, { reason });
  },

  async uploadProfilePicture(file: File): Promise<{ status: string; message: string; data: { profileImageUrl: string } }> {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const mb = (file.size / 1024 / 1024).toFixed(2);
      throw new Error(`Image size is ${mb}MB. Maximum allowed size is 5MB. Please select a smaller image.`);
    }
    const form = new FormData();
    form.append("image", file);
    return (await http.post<{ profileImageUrl: string }>("/vendors/me/profile-picture", form)) as any;
  },

  async getPortfolio(serviceType?: string, mediaType?: string, page: number = 1, limit: number = 20): Promise<any> {
    return http.get("/vendors/me/portfolio", {
      serviceType,
      mediaType: mediaType && ["image", "video"].includes(mediaType) ? mediaType : undefined,
      page,
      limit,
    });
  },

  /** FormData fields: title, description, serviceType, cost, displayOrder, youtubeUrl, media (file) */
  async createPortfolioItem(formData: FormData): Promise<any> {
    return http.post("/vendors/me/portfolio", formData);
  },

  async updatePortfolioItem(portfolioId: string, formData: FormData): Promise<any> {
    return http.patch(`/vendors/me/portfolio/${portfolioId}`, formData);
  },

  async deletePortfolioItem(portfolioId: string): Promise<any> {
    return http.delete(`/vendors/me/portfolio/${portfolioId}`);
  },
};
