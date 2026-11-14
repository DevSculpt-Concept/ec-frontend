import { http } from "@/lib/http";

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  action_url?: string;
  priority: "low" | "normal" | "high";
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface NotificationResponse {
  status: string;
  message: string;
  data: {
    notifications: AppNotification[];
    unreadCount: number;
    total: number;
    typeBreakdown: Record<string, number>;
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
}

export const notificationService = {
  async getNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
    type?: string,
    priority?: string,
  ): Promise<NotificationResponse> {
    const res = await http.get<NotificationResponse["data"]>("/notifications", {
      page,
      limit,
      unreadOnly: unreadOnly ? "true" : undefined,
      type,
      priority,
    });
    return res as unknown as NotificationResponse;
  },

  async getStats(): Promise<{ data: NotificationStats }> {
    const res = await http.get<NotificationStats>("/notifications/stats");
    return { data: res.data };
  },

  async markAsRead(notificationId: string): Promise<{ status: string; message: string }> {
    const res = await http.patch(`/notifications/${notificationId}/read`);
    return { status: res.status, message: res.message };
  },

  async markAllAsRead(): Promise<{ status: string; message: string }> {
    const res = await http.patch("/notifications/read-all");
    return { status: res.status, message: res.message };
  },

  async deleteNotification(notificationId: string): Promise<{ status: string; message: string }> {
    const res = await http.delete(`/notifications/${notificationId}`);
    return { status: res.status, message: res.message };
  },

  async clearReadNotifications(): Promise<{ status: string; message: string }> {
    const res = await http.delete("/notifications/read");
    return { status: res.status, message: res.message };
  },
};
