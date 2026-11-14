import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "@/services/api/review.service";
import { showToast } from "@/lib/toast";

/**
 * Hook to fetch reviews for a vendor
 */
export const useVendorReviews = (vendorId: string, page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["reviews", "vendor", vendorId, page, limit],
    queryFn: () => reviewService.getVendorReviews(vendorId, page, limit),
    enabled: !!vendorId,
  });
};

/**
 * Hook to fetch review for a specific booking
 */
export const useBookingReview = (bookingId: string) => {
  return useQuery({
    queryKey: ["reviews", "booking", bookingId],
    queryFn: () => reviewService.getBookingReview(bookingId),
    enabled: !!bookingId,
  });
};

/**
 * Hook to create a review
 */
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, rating, comment }: { bookingId: string; rating: number; comment?: string }) =>
      reviewService.createReview(bookingId, rating, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      // Invalidate vendor details to refresh reviews
      if (data?.data?.vendor_id) {
        queryClient.invalidateQueries({ queryKey: ["vendors", data.data.vendor_id] });
        queryClient.invalidateQueries({ queryKey: ["vendor-details"] });
      }
      showToast.success("Review submitted successfully! Thank you for your feedback.");
    },
    onError: (error: Error) => {
      showToast.error("Failed to submit review", error.message);
    },
  });
};

/**
 * Hook to update a review
 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, rating, comment }: { reviewId: string; rating?: number; comment?: string }) =>
      reviewService.updateReview(reviewId, rating, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      // Invalidate vendor details to refresh reviews
      if (data?.data?.vendor_id) {
        queryClient.invalidateQueries({ queryKey: ["vendors", data.data.vendor_id] });
        queryClient.invalidateQueries({ queryKey: ["vendor-details"] });
      }
      showToast.success("Review updated successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to update review", error.message);
    },
  });
};

/**
 * Hook to delete a review
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      showToast.success("Review deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to delete review", error.message);
    },
  });
};

/**
 * Hook to mark a review as helpful
 */
export const useMarkReviewHelpful = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewService.markReviewHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useCreateVendorReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, rating, comment }: { vendorId: string; rating: number; comment?: string }) =>
      reviewService.createVendorReview(vendorId, rating, comment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (data?.data?.vendor_id) {
        queryClient.invalidateQueries({ queryKey: ["vendors", data.data.vendor_id] });
        queryClient.invalidateQueries({ queryKey: ["vendor-details"] });
      }
      showToast.success("Review submitted successfully!");
    },
    onError: (error: Error) => {
      showToast.error("Failed to submit review", error.message);
    },
  });
};

