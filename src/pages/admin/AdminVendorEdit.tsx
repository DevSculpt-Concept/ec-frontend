import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { useVendorDetails, useUpdateVendor } from "@/hooks/useAdmin";

export function AdminVendorEdit() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();

  const { data: vendorData, isLoading, isError } = useVendorDetails(vendorId || "");
  const updateVendorMutation = useUpdateVendor();

  const [formData, setFormData] = useState({
    business_name: "",
    bio: "",
    primary_location: "",
    service_types: [] as string[],
    website_url: "",
    instagram_url: "",
    facebook_url: "",
    contact_number: "",
    whatsapp_number: "",
    is_active: true,
    is_verified: false,
  });

  // Populate form when data loads
  useEffect(() => {
    if (vendorData?.data?.vendor) {
      const vendor = vendorData.data.vendor;
      setFormData({
        business_name: vendor.businessName || "",
        bio: vendor.bio || "",
        primary_location: vendor.primaryLocation || "",
        service_types: vendor.serviceTypes || [],
        website_url: vendor.social?.website || "",
        instagram_url: vendor.social?.instagram || "",
        facebook_url: vendor.social?.facebook || "",
        contact_number: vendor.contact?.phone || "",
        whatsapp_number: vendor.contact?.whatsapp || "",
        is_active: vendor.isActive,
        is_verified: vendor.isVerified,
      });
    }
  }, [vendorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vendorId) return;

    try {
      await updateVendorMutation.mutateAsync({
        vendorId,
        data: formData,
      });
      showToast.success("Vendor profile updated successfully");
      navigate(`/admin/vendors/${vendorId}`);
    } catch (error) {
      showToast.error("Failed to update vendor", error instanceof Error ? error.message : "Please try again");
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/vendors/${vendorId}`)}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700">Failed to load vendor details</h3>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/vendors")}
              className="mt-4 cursor-pointer"
            >
              Go Back
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Vendor Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number
                </label>
                <Input
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <Input
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  value={formData.primary_location}
                  onChange={(e) => setFormData({ ...formData, primary_location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <Input
                  type="text"
                  placeholder="https://example.com"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram URL
                </label>
                <Input
                  type="text"
                  placeholder="https://instagram.com/handle"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook URL
                </label>
                <Input
                  type="text"
                  placeholder="https://facebook.com/page"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Account</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified Vendor</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/vendors/${vendorId}`)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="cursor-pointer"
                disabled={updateVendorMutation.isPending}
              >
                {updateVendorMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
