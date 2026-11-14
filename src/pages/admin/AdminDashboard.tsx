/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
  Users,
} from "lucide-react";
import { useDashboardStats, usePendingApprovals, useApproveVendor, useRejectVendor, useRecentReports } from "@/hooks/useAdmin";
import { useAllTickets } from "@/hooks/useSupport";
import { showToast } from "@/lib/toast";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: approvalsData, isLoading: approvalsLoading } = usePendingApprovals(3);
  useRecentReports(2); // Fetch recent reports
  const { data: ticketsData, isLoading: ticketsLoading } = useAllTickets(undefined, undefined, undefined, 1, 5);
  const approveVendorMutation = useApproveVendor();
  const rejectVendorMutation = useRejectVendor();

  const recentTickets = ticketsData?.data?.tickets || [];

  const handleApprove = async (vendorId: string) => {
    try {
      await approveVendorMutation.mutateAsync(vendorId);
      showToast.success("Vendor approved successfully");
    } catch (error) {
      showToast.error("Failed to approve vendor", error instanceof Error ? error.message : "Please try again");
    }
  };

  const handleReject = async (vendorId: string) => {
    try {
      await rejectVendorMutation.mutateAsync({ vendorId });
      showToast.success("Vendor rejected successfully");
    } catch (error) {
      showToast.error("Failed to reject vendor", error instanceof Error ? error.message : "Please try again");
    }
  };

  const stats = statsData?.data ? [
    {
      label: "Total Users",
      value: statsData.data.totalUsers.toLocaleString(),
      change: `${statsData.data.usersGrowth} vs last month`,
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Active Vendors",
      value: statsData.data.activeVendors.toLocaleString(),
      change: `${statsData.data.vendorsGrowth} vs last month`,
      icon: Store,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ] : [];

  const pendingApprovals = approvalsData?.data?.approvals || [];

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="space-y-6 md:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {statsLoading ? (
            <>
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </>
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <h3 className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`${stat.iconBg} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Pending Approvals
              </h2>
              <span className="px-3 py-1 bg-pink-100 text-primary text-sm font-medium rounded-full">
                {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4">
              {approvalsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                  ))}
                </>
              ) : pendingApprovals.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                  <p>No pending approvals</p>
                </div>
              ) : (
                pendingApprovals.map((approval) => (
                  <div
                    key={approval.id}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {approval.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {approval.category} • {approval.location}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      Owner: {approval.ownerName} ({approval.email})
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Submitted: {approval.submittedDate}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(approval.id)}
                        disabled={approveVendorMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
                        size="default"
                      >
                        {approveVendorMutation.isPending ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        onClick={() => handleReject(approval.id)}
                        disabled={rejectVendorMutation.isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer"
                        size="default"
                      >
                        {rejectVendorMutation.isPending ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Support Tickets */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Support Tickets
              </h2>
              <span className="px-3 py-1 bg-pink-100 text-primary text-sm font-medium rounded-full">
                {recentTickets.filter((t: any) => t.status === 'open').length} Open
              </span>
            </div>

            <div className="space-y-4">
              {ticketsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </>
              ) : recentTickets.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                  <p>No recent support tickets</p>
                </div>
              ) : (
                recentTickets.map((ticket: any) => (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/admin/reports/ticket/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.subject}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Ticket #{ticket.ticket_number} • {ticket.users?.full_name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${ticket.status === "open"
                          ? "bg-blue-100 text-blue-700"
                          : ticket.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : ticket.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {ticket.status.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: <span className="font-medium">{ticket.category}</span></span>
                      <span>Priority: <span className="font-medium">{ticket.priority}</span></span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => navigate("/admin/reports")}
              >
                View All Tickets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
