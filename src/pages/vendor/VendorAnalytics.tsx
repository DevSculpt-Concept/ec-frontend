import { VendorLayout } from "@/components/layout/VendorLayout";
import {
  Eye,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";


interface ServiceData {
  id: number;
  service: string;
  requests: number;
  conversionRate: number;
}

const topServices: ServiceData[] = [
  {
    id: 1,
    service: "New Born Shoot",
    requests: 250,
    conversionRate: 12,
  },
  {
    id: 2,
    service: "Bridal Shower",
    requests: 180,
    conversionRate: 18,
  },
  {
    id: 3,
    service: "Wedding Shoot",
    requests: 150,
    conversionRate: 10,
  },
];

export function VendorAnalytics() {
  const [timeRange, setTimeRange] = useState<"Monthly" | "Seasonal">("Monthly");

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Insights
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Track your performance and understand your audience better.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">1,234</h3>
            <p className="text-sm text-gray-600">Page Views</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">567</h3>
            <p className="text-sm text-gray-600">Profile Visits</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">15%</h3>
            <p className="text-sm text-gray-600">Conversion Rate</p>
          </div>
        </div>

        {/* Top Requested Services */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Top Requested Services
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Requests
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {service.service}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {service.requests}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-primary">
                      {service.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booking Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Booking Trends
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setTimeRange("Monthly")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                timeRange === "Monthly"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeRange("Seasonal")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                timeRange === "Seasonal"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Seasonal
            </button>
          </div>

          {/* Chart Placeholder */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                Monthly Bookings
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Chart visualization will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
