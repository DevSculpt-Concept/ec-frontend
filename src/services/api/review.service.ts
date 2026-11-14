import { http } from "@/lib/http";

export interface Review {
  id: string;
  booking_id?: string;
  user_id: string;
  vendor_id: string;
  rating: number;
  comment?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  users?: { id: string; full_name: string; profile_image_url?: string };
  bookings?: { event_title: string; event_date: string };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface VendorReviewsResponse {
  status: string;
  message: string;
  data: {
    reviews: Review[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
    stats: ReviewStats;
  };
}

export const reviewService = {
  async createReview(bookingId: string, rating: number, comment?: string): Promise<{ data: Review }> {
    const res = await http.post<Review>("/reviews", { bookingId, rating, comment });
    return { data: res.data };
  },

  async createVendorReview(vendorId: string, rating: number, comment?: string): Promise<{ data: Review }> {
    const res = await http.post<Review>("/reviews", { vendorId, rating, comment });
    return { data: res.data };
  },

  async getVendorReviews(vendorId: string, page: number = 1, limit: number = 10): Promise<VendorReviewsResponse> {
    const res = await http.get<VendorReviewsResponse["data"]>(`/vendors/${vendorId}/reviews`, { page, limit }, { auth: false });
    return res as unknown as VendorReviewsResponse;
  },

  async getBookingReview(bookingId: string): Promise<{ data: { review: Review | null } }> {
    const res = await http.get<{ review: Review | null }>(`/reviews/booking/${bookingId}`);
    return { data: res.data };
  },

  async updateReview(reviewId: string, rating?: number, comment?: string): Promise<{ data: Review }> {
    const res = await http.patch<Review>(`/reviews/${reviewId}`, { rating, comment });
    return { data: res.data };
  },

  async deleteReview(reviewId: string): Promise<void> {
    await http.delete(`/reviews/${reviewId}`);
  },

  async markReviewHelpful(reviewId: string): Promise<void> {
    await http.post(`/reviews/${reviewId}/helpful`);
  },
};
