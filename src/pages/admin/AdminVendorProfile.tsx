import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Globe,
  CheckCircle,
  Store,
  AlertCircle,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useVendorDetails } from "@/hooks/useAdmin";

export function AdminVendorProfile() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const { data: vendorData, isLoading, isError } = useVendorDetails(vendorId || "");
  const vendor = vendorData?.data?.vendor;
  const reviews = vendorData?.data?.reviews || [];

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/vendors")}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vendors
          </Button>
         
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700">Failed to load vendor details</h3>
            <p className="text-red-600 mt-2">Please try again later</p>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/vendors")}
              className="mt-4 cursor-pointer"
            >
              Go Back
            </Button>
          </div>
        )}

        {!isLoading && !isError && vendor && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6 mb-6 pb-6 border-b border-gray-200">
              {vendor.profileImage ? (
                <img
                  src={vendor.profileImage}
                  alt={vendor.businessName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white font-bold text-3xl">
                  {vendor.businessName?.charAt(0) || "V"}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
                  {vendor.isVerified && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 mb-1">{vendor.ownerName}</p>
                <p className="text-gray-600 mb-4">{vendor.email}</p>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${vendor.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : vendor.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {vendor.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{(vendor.rating || 0).toFixed(1)}</span>
                    <span className="text-gray-600">({vendor.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Services</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {vendor.serviceTypes?.join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">{vendor.primaryLocation || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      {vendor.social?.website ? (
                        <a 
                          href={vendor.social.website.startsWith('http') ? vendor.social.website : `https://${vendor.social.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium text-primary hover:underline"
                        >
                          {vendor.social.website}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <div>
                      <p className="text-sm text-gray-600">Instagram</p>
                      {vendor.social?.instagram ? (
                        <a 
                          href={vendor.social.instagram.startsWith('http') ? vendor.social.instagram : `https://${vendor.social.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium text-primary hover:underline"
                        >
                          {vendor.social.instagram}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900">Not provided</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Facebook</p>
                      {vendor.social?.facebook ? (
                        <a 
                          href={vendor.social.facebook.startsWith('http') ? vendor.social.facebook : `https://${vendor.social.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium text-primary hover:underline"
                        >
                          {vendor.social.facebook}
                        </a>
                      ) : (
                        <p className="font-medium text-gray-900">Not provided</p>
                      )}
                    </div>
                  </div>
                  {vendor.bio && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bio</p>
                      <p className="font-medium text-gray-900">{vendor.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{vendor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{vendor.contact?.phone || vendor.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <p className="font-medium text-gray-900">{vendor.contact?.whatsapp || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{(vendor.rating || 0).toFixed(1)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

