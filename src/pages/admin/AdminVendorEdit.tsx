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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { showToast } from "@/lib/toast";
import { useVendorDetails, useUpdateVendor } from "@/hooks/useAdmin";
import { useAllServiceTypes } from "@/hooks/useServiceTypes";
import { VendorPhotoUploader } from "@/components/admin/VendorPhotoUploader";
import { VendorPricingEditor } from "@/components/admin/VendorPricingEditor";
import { VendorPortfolioManager } from "@/components/admin/VendorPortfolioManager";

type Tab = "profile" | "pricing" | "portfolio";

export function AdminVendorEdit() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSetup = searchParams.get("setup") === "1"; // arrived straight after "Add vendor"
  const [tab, setTab] = useState<Tab>("profile");

  const { data: vendorData, isLoading, isError } = useVendorDetails(vendorId || "");
  const { data: serviceTypesData } = useAllServiceTypes(false);
  const availableServiceTypes = serviceTypesData?.data?.serviceTypes || [];
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
      if (isSetup) {
        showToast.success("Profile saved", "Now set prices and add portfolio items.");
        setTab("pricing");
      } else {
        showToast.success("Vendor profile updated successfully");
        navigate(`/admin/vendors/${vendorId}`);
      }
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

        {!isLoading && !isError && isSetup && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            Vendor created and verified. Finish setting them up: add their photo, service types, prices and portfolio below.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <VendorPhotoUploader
              vendorId={vendorId || ""}
              imageUrl={vendorData?.data?.vendor?.profileImage}
              name={formData.business_name || "Vendor"}
            />
            <div className="flex gap-2 border-b border-gray-200">
              {([["profile", "Profile"], ["pricing", "Pricing"], ["portfolio", "Portfolio"]] as [Tab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 cursor-pointer ${tab === key ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "pricing" && <VendorPricingEditor vendorId={vendorId || ""} />}
            {tab === "portfolio" && <VendorPortfolioManager vendorId={vendorId || ""} serviceTypes={vendorData?.data?.vendor?.serviceTypes || []} />}
          </div>
        )}

        {!isLoading && !isError && tab === "profile" && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Types</label>
                {availableServiceTypes.length === 0 ? (
                  <p className="text-sm text-gray-500">No service types available. Add some under Service Types.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border border-gray-200 rounded-lg p-3">
                    {availableServiceTypes.map((st) => {
                      const on = formData.service_types.includes(st.name);
                      return (
                        <label
                          key={st.id}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${on ? "bg-primary/10 border border-primary" : "bg-gray-50 border border-transparent hover:bg-gray-100"}`}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() =>
                              setFormData({
                                ...formData,
                                service_types: on ? formData.service_types.filter((x) => x !== st.name) : [...formData.service_types, st.name],
                              })
                            }
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-gray-700">{st.display_name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Save the profile after changing services; pricing and portfolio use these.</p>
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
