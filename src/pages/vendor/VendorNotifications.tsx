import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { vendorNavItems } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bell, Check, CheckCheck, ChevronLeft, ChevronRight, Filter, Trash2,
  ExternalLink, AlertCircle, Calendar, CreditCard, MessageSquare, Star, DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications, useNotificationStats, useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead, useDeleteNotification, useClearReadNotifications,
} from "@/hooks/useNotification";
import type { AppNotification } from "@/services/api/notification.service";
import { formatDistanceToNow } from "date-fns";

const notificationIcons: Record<string, React.ElementType> = {
  vendor_welcome: Bell, vendor_verified: Check, new_booking_request: Calendar,
  booking_payment_received: CreditCard, new_review: Star, earnings_available: DollarSign,
  withdrawal_processed: CreditCard, message_received: MessageSquare,
  booking_confirmed: Calendar, booking_cancelled: AlertCircle,
};

const priorityColors = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-600",
  high: "bg-red-100 text-red-600",
};

const formatType = (type: string) => type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export function VendorNotifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const { data: notificationsData, isLoading } = useNotifications(page, 15, filter === "unread", typeFilter || undefined);
  const { data: statsData } = useNotificationStats();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const clearReadMutation = useClearReadNotifications();

  const notifications = notificationsData?.data?.notifications || [];
  const pagination = notificationsData?.data?.pagination;
  const stats = statsData?.data;
  const typeBreakdown = notificationsData?.data?.typeBreakdown || {};

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.is_read) await markAsReadMutation.mutateAsync(notification.id);
    if (notification.action_url) navigate(notification.action_url);
  };

  const getIcon = (type: string) => notificationIcons[type] || Bell;

  const handleDeleteClick = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationToDelete(notificationId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!notificationToDelete) return;
    try {
      await deleteNotificationMutation.mutateAsync(notificationToDelete);
      setDeleteConfirmOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <DashboardLayout title="Vendor Dashboard" navItems={vendorNavItems}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 text-sm mt-1">Stay updated on bookings and activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => markAllAsReadMutation.mutate()} disabled={markAllAsReadMutation.isPending || !stats?.unread}>
              <CheckCheck className="w-4 h-4 mr-2" />Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={() => clearReadMutation.mutate()} disabled={clearReadMutation.isPending} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4 mr-2" />Clear Read
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Bell className="w-5 h-5 text-blue-600" /></div>
              <div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><AlertCircle className="w-5 h-5 text-yellow-600" /></div>
              <div><p className="text-sm text-gray-600">Unread</p><p className="text-2xl font-bold text-gray-900">{stats?.unread || 0}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><AlertCircle className="w-5 h-5 text-red-600" /></div>
              <div><p className="text-sm text-gray-600">High Priority</p><p className="text-2xl font-bold text-gray-900">{stats?.highPriority || 0}</p></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <div className="flex gap-2">
              {["all", "unread"].map((f) => (
                <button key={f} onClick={() => setFilter(f as "all" | "unread")} className={`px-3 py-1.5 rounded-full text-sm font-medium ${filter === f ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {f === "all" ? "All" : `Unread (${stats?.unread || 0})`}
                </button>
              ))}
            </div>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm">
              <option value="">All Types</option>
              {Object.entries(typeBreakdown).map(([type, count]) => (<option key={type} value={type}>{formatType(type)} ({count})</option>))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="p-4 flex gap-4"><Skeleton className="w-10 h-10 rounded-full" /><div className="flex-1"><Skeleton className="h-4 w-1/3 mb-2" /><Skeleton className="h-3 w-2/3" /></div></div>))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No notifications</p>
              <p className="text-sm text-gray-500 mt-1">{filter === "unread" ? "All caught up!" : "You don't have any notifications yet"}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.type);
                return (
                  <div key={notification.id} onClick={() => handleNotificationClick(notification)} className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 ${!notification.is_read ? "bg-blue-50/50" : ""}`}>
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.priority === "high" ? "bg-red-100" : "bg-blue-100"}`}>
                      <Icon className={`w-5 h-5 ${notification.priority === "high" ? "text-red-600" : "text-blue-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          {!notification.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[notification.priority]}`}>{notification.priority}</span>
                        <span className="text-xs text-gray-500">{formatType(notification.type)}</span>
                        {notification.action_url && <ExternalLink className="w-3 h-3 text-gray-400" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <button onClick={(e) => { e.stopPropagation(); markAsReadMutation.mutate(notification.id); }} className="p-2 hover:bg-gray-100 rounded-full" title="Mark as read">
                          <Check className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDeleteClick(notification.id, e)} 
                        disabled={deleteNotificationMutation.isPending}
                        className="p-2 hover:bg-red-50 rounded-full disabled:opacity-50" 
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}><ChevronRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Notification</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this notification? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setNotificationToDelete(null);
                }}
                disabled={deleteNotificationMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteNotificationMutation.isPending}
                className="flex items-center gap-2"
              >
                {deleteNotificationMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

