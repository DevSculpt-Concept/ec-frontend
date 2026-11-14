import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/api/notification.service";
import { showToast } from "@/lib/toast";

/**
 * Hook to fetch all notifications with pagination
 */
export const useNotifications = (
  page: number = 1,
  limit: number = 20,
  unreadOnly: boolean = false,
  type?: string,
  priority?: string
) => {
  return useQuery({
    queryKey: ["notifications", page, limit, unreadOnly, type, priority],
    queryFn: () => notificationService.getNotifications(page, limit, unreadOnly, type, priority),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to fetch notification statistics
 */
export const useNotificationStats = () => {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: () => notificationService.getStats(),
    refetchInterval: 30000,
  });
};

/**
 * Hook to mark a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast.success("All notifications marked as read");
    },
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast.success("Notification deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to delete notification", error.message);
    },
  });
};

/**
 * Hook to clear all read notifications
 */
export const useClearReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.clearReadNotifications(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      showToast.success("Read notifications cleared");
    },
  });
};
