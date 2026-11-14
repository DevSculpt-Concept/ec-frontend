/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorService } from "@/services/api/vendor.service";
import { showToast } from "@/lib/toast";

export const useVendorDashboard = () => {
  return useQuery({
    queryKey: ["vendor", "dashboard"],
    queryFn: () => vendorService.getDashboard(),
  });
};

export const useVendorProfile = () => {
  return useQuery({
    queryKey: ["vendor", "profile"],
    queryFn: async () => {
      const response = await vendorService.getProfile();
      // Map the backend snake_case to the camelCase the UI expects
      if (response.data?.user) {
        (response.data.user as any).profileImageUrl = response.data.user.profile_image_url;
      }
      return response;
    },
  });
};

export const useUpdateVendorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof vendorService.updateProfile>[0]) =>
      vendorService.updateProfile(data),
    onSuccess: async (response) => {
      // Update the cache with the new data immediately
      if (response?.data?.user) {
        queryClient.setQueryData(["vendor", "profile"], response);
      }
      // Also invalidate to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      showToast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to update profile", error.message);
    },
  });
};

export const useVendorServicePricing = () => {
  return useQuery({
    queryKey: ["vendor", "pricing"],
    queryFn: () => vendorService.getServicePricing(),
  });
};

export const useUpdateServicePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceType, price }: { serviceType: string; price: number }) =>
      vendorService.updateServicePricing(serviceType, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "pricing"] });
      showToast.success("Pricing updated successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to update pricing", error.message);
    },
  });
};

export const useVendorBookings = (status?: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["vendor", "bookings", status, page, limit],
    queryFn: () => vendorService.getBookings(status, page, limit),
  });
};

export const useAcceptBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => vendorService.acceptBooking(bookingId),
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      showToast.success("Booking accepted successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to accept booking", error.message);
    },
  });
};

export const useRejectBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      vendorService.rejectBooking(bookingId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      showToast.success("Booking rejected successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to reject booking", error.message);
    },
  });
};

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => vendorService.uploadProfilePicture(file),
    onSuccess: async (response) => {
      if (response?.data?.profileImageUrl) {
        // Update the cache with the new profile image URL
        queryClient.setQueryData(["vendor", "profile"], (oldData: any) => {
          if (oldData?.data?.user) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                user: {
                  ...oldData.data.user,
                  profile_image_url: response.data.profileImageUrl,
                },
              },
            };
          }
          return oldData;
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      showToast.success("Profile picture updated successfully");
    },
    onError: (error: Error) => {
      // Check if error message contains file size information
      const errorMessage = error.message || "Failed to upload profile picture";
      if (errorMessage.includes("MB") || errorMessage.includes("size")) {
        showToast.error("Image too large", errorMessage);
      } else {
        showToast.error("Failed to upload profile picture", errorMessage);
      }
    },
  });
};

export const useVendorPortfolio = (serviceType?: string, mediaType?: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["vendor", "portfolio", serviceType, mediaType, page, limit],
    queryFn: () => vendorService.getPortfolio(serviceType, mediaType, page, limit),
  });
};

export const useCreatePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => vendorService.createPortfolioItem(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "portfolio"] });
      showToast.success("Portfolio item created successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to create portfolio item", error.message);
    },
  });
};

export const useUpdatePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, formData }: { portfolioId: string; formData: FormData }) =>
      vendorService.updatePortfolioItem(portfolioId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "portfolio"] });
      showToast.success("Portfolio item updated successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to update portfolio item", error.message);
    },
  });
};

export const useDeletePortfolioItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) => vendorService.deletePortfolioItem(portfolioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "portfolio"] });
      showToast.success("Portfolio item deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to delete portfolio item", error.message);
    },
  });
};

