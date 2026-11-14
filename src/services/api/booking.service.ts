import { http } from "@/lib/http";

export interface Booking {
  id: string;
  booking_reference: string;
  user_id: string;
  vendor_id: string;
  service_type: string;
  event_title: string;
  event_type?: string;
  event_date: string;
  event_location?: string;
  guest_count?: number;
  notes?: string;
  total_amount: number;
  booking_status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  vendor_profiles?: { id: string; business_name: string; [key: string]: unknown };
}

export interface CreateBookingData {
  vendorId: string;
  serviceType: string;
  eventTitle: string;
  eventType?: string;
  eventDate: string;
  eventLocation?: string;
  guestCount?: number;
  notes?: string;
  /** Optional – defaults to the vendor's listed price for the service. */
  totalAmount?: number;
}

type Pagination = { page: number; limit: number; total: number; totalPages: number };

export const bookingService = {
  createBooking: async (data: CreateBookingData) =>
    http.post<{ booking: Booking }>("/bookings", data),

  getMyBookings: async (status?: string, page = 1, limit = 20) =>
    http.get<{ bookings: Booking[]; pagination: Pagination }>("/bookings", { status, page, limit }),

  getBooking: async (bookingId: string) =>
    http.get<{ booking: Booking }>(`/bookings/${bookingId}`),

  cancelBooking: async (bookingId: string, reason?: string) =>
    http.patch<{ booking: Booking }>(`/bookings/${bookingId}/cancel`, { reason }),
};

export default bookingService;
