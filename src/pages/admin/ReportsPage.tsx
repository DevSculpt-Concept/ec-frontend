import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { useAllTickets, useUpdateTicketStatus } from "@/hooks/useSupport";
import { showToast } from "@/lib/toast";

export function ReportsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const { data: ticketsData, isLoading, isError } = useAllTickets(
    statusFilter || undefined,
    categoryFilter || undefined,
    priorityFilter || undefined,
    page,
    20
  );
  const updateStatusMutation = useUpdateTicketStatus();

  const tickets = ticketsData?.data?.tickets || [];
  const pagination = (ticketsData?.data?.pagination || {}) as any;

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ ticketId, status: newStatus });
      showToast.success("Ticket status updated successfully");
    } catch (error) {
      showToast.error("Failed to update ticket status", error instanceof Error ? error.message : "Please try again");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
      open: { bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
      in_progress: { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      resolved: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
      closed: { bg: "bg-gray-100", text: "text-gray-800", icon: XCircle },
    };

    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800", icon: HelpCircle };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { bg: string; text: string }> = {
      low: { bg: "bg-gray-100", text: "text-gray-700" },
      medium: { bg: "bg-blue-100", text: "text-blue-700" },
      high: { bg: "bg-orange-100", text: "text-orange-700" },
      urgent: { bg: "bg-red-100", text: "text-red-700" },
    };

    const config = priorityConfig[priority] || { bg: "bg-gray-100", text: "text-gray-700" };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets & Reports</h1>
          <p className="text-gray-600 mt-1">Manage user and vendor support requests</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="booking">Booking</option>
            <option value="payment">Payment</option>
            <option value="account">Account</option>
            <option value="vendor">Vendor</option>
            <option value="other">Other</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to load support tickets
            </h3>
            <p className="text-red-700">Please try again later</p>
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && !isError && (
          <>
            {tickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No support tickets found
                </h3>
                <p className="text-gray-600">
                  No tickets match your filter criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Ticket #{ticket.ticket_number}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap gap-3 items-center text-sm">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                          <span className="text-gray-600">
                            Category: <span className="font-medium">{ticket.category}</span>
                          </span>
                          <span className="text-gray-600">
                            User: <span className="font-medium">{ticket.users?.full_name || "N/A"}</span>
                          </span>
                          <span className="text-gray-600">
                            Created: {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 lg:min-w-[180px]">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full cursor-pointer"
                          onClick={() => window.location.href = `/admin/reports/ticket/${ticket.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View & Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalResults} total)
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

