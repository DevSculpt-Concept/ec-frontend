import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Store,
  TrendingUp,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import { useAdminAnalytics } from "@/hooks/useAdmin";

export function AnalyticsPage() {
  const { data: analyticsData, isLoading, refetch } = useAdminAnalytics();
  const analytics = analyticsData?.data;

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      photography: "Photography",
      catering: "Catering",
      event_planning: "Event Planning",
      decoration: "Decoration",
    };
    return labels[type] || type;
  };



  if (isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of platform performance</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +{analytics?.overview?.newUsersThisMonth || 0} this month
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-4">
              {analytics?.overview?.totalUsers || 0}
            </h3>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>

          {/* Total Vendors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
              <span className="flex items-center text-sm text-blue-600">
                {analytics?.overview?.activeVendors || 0} active
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-4">
              {analytics?.overview?.totalVendors || 0}
            </h3>
            <p className="text-sm text-gray-500">Registered Vendors</p>
          </div>



          {/* Platform Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 opacity-70" />
            </div>
            <h3 className="text-3xl font-bold mt-4">
              {formatCurrency(analytics?.overview?.totalPlatformRevenue || 0)}
            </h3>
            <p className="text-sm opacity-90">Platform Revenue</p>
            <p className="text-xs opacity-75 mt-1">
              {formatCurrency(analytics?.overview?.platformRevenueThisMonth || 0)} this month
            </p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Gross Transaction Volume</h4>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics?.overview?.totalGrossRevenue || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total payments processed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Active Vendors</h4>
            <p className="text-2xl font-bold text-gray-900">
              {analytics?.overview?.activeVendors || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">Active in our network</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">New Users This Month</h4>
            <p className="text-2xl font-bold text-gray-900">
              {analytics?.overview?.newUsersThisMonth || 0}
            </p>
            <p className="text-xs text-gray-400 mt-1">User registrations</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6">


          {/* Service Type Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Service Type Distribution</h3>
            </div>
            <div className="space-y-4">
              {analytics?.distributions?.serviceType &&
                Object.entries(analytics.distributions.serviceType).map(([type, count]: [string, any]) => {
                  const total = Object.values(analytics.distributions.serviceType).reduce((a: number, b: any) => a + b, 0) as number;
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
                  const colorIndex = Object.keys(analytics.distributions.serviceType).indexOf(type) % colors.length;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{getServiceTypeLabel(type)}</span>
                        <span className="text-sm font-medium">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${colors[colorIndex]} h-2 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              {(!analytics?.distributions?.serviceType ||
                Object.keys(analytics.distributions.serviceType).length === 0) && (
                  <p className="text-gray-500 text-center py-8">No service data available</p>
                )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Vendors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Top Vendors</h3>
            </div>
            <div className="space-y-3">
              {analytics?.topVendors?.map((vendor: any, index: number) => (
                <div
                  key={vendor.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{vendor.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">Top Performer</span>
                </div>
              ))}
              {(!analytics?.topVendors || analytics.topVendors.length === 0) && (
                <p className="text-gray-500 text-center py-8">No vendor data available</p>
              )}
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
            </div>
            <div className="space-y-3">
              {analytics?.monthlyRevenueTrend &&
                Object.entries(analytics.monthlyRevenueTrend).map(([month, data]: [string, any]) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{month}</span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        +{formatCurrency(data.platformFee)}
                      </p>
                      <p className="text-xs text-gray-500">
                        from {formatCurrency(data.grossAmount)} gross
                      </p>
                    </div>
                  </div>
                ))}
              {(!analytics?.monthlyRevenueTrend ||
                Object.keys(analytics.monthlyRevenueTrend).length === 0) && (
                  <p className="text-gray-500 text-center py-8">No revenue data available</p>
                )}
            </div>
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Payment Status Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {analytics?.distributions?.paymentStatus &&
              Object.entries(analytics.distributions.paymentStatus).map(([status, count]: [string, any]) => {
                const colors: Record<string, string> = {
                  paid: 'bg-green-100 text-green-700 border-green-200',
                  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  refunded: 'bg-red-100 text-red-700 border-red-200',
                  failed: 'bg-gray-100 text-gray-700 border-gray-200',
                };
                return (
                  <div key={status} className={`${colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'} rounded-lg p-4 border`}>
                    <p className="text-sm font-medium capitalize">{status}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                );
              })}
            {(!analytics?.distributions?.paymentStatus ||
              Object.keys(analytics.distributions.paymentStatus).length === 0) && (
                <p className="col-span-4 text-gray-500 text-center py-8">No payment data available</p>
              )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
