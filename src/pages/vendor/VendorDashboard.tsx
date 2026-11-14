import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
} from "lucide-react";
import { Route, Routes } from "react-router-dom";
import { VendorPortfolio } from "./VendorPortfolio";
import { VendorProfile } from "./VendorProfile";
import { VendorSupport } from "./VendorSupport";
import { VendorUpload } from "./VendorUpload";
import { TicketDetails } from "./TicketDetails";
import { useVendorDashboard } from "@/hooks/useVendor";
import { useNavigate } from "react-router-dom";

function VendorOverview() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useVendorDashboard();

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (isError || !data) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load dashboard data</p>
            <p className="text-gray-600 text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  const stats = data.data.statistics;

  const statsConfig = [
    {
      label: "Total Reviews",
      value: stats.reviews.value.toString(),
      change: `${stats.reviews.averageRating} average rating`,
      icon: MessageSquare,
      type: "reviews",
      trend: stats.reviews.trend,
    },
  ];

  return (
    <VendorLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 md:gap-6">
          {statsConfig.map((stat, index) => {
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
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p
                  className={`text-sm ${stat.trend === "up"
                    ? "text-green-600"
                    : stat.trend === "down"
                      ? "text-red-600"
                      : "text-gray-600"
                    }`}
                >
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Update your profile and showcase your portfolio to attract more clients.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/vendor/dashboard/profile")}
                className="w-full"
              >
                Update Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/vendor/dashboard/portfolio")}
                className="w-full"
              >
                Manage Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}

export function VendorDashboard() {
  return (
    <Routes>
      <Route index element={<VendorOverview />} />
      <Route path="profile" element={<VendorProfile />} />
      <Route path="support" element={<VendorSupport />} />
      <Route path="support/:ticketId" element={<TicketDetails />} />
      <Route path="portfolio" element={<VendorPortfolio />} />
      <Route path="upload" element={<VendorUpload />} />
    </Routes>
  );
}
