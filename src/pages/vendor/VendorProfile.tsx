/* eslint-disable @typescript-eslint/no-explicit-any */
import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/ui/loader";
import { Camera, Edit, Loader2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  useVendorProfile,
  useUpdateVendorProfile,
  useVendorServicePricing,
  useUpdateServicePricing,
  useUploadProfilePicture,
} from "@/hooks/useVendor";
import { useServiceTypes } from "@/hooks/useService";
import { showToast } from "@/lib/toast";
import { formatPhoneForWhatsApp } from "@/lib/utils"; // I'll check if this exists or add it

export function VendorProfile() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useVendorProfile();
  const { data: pricingData } = useVendorServicePricing();
  const { data: serviceTypesData } = useServiceTypes();
  const updateProfileMutation = useUpdateVendorProfile();
  const updatePricingMutation = useUpdateServicePricing();
  const uploadProfilePictureMutation = useUploadProfilePicture();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    businessName: "",
    bio: "",
    primaryLocation: "",
    whatsappNumber: "",
    contactNumber: "",
    websiteUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    serviceTypes: [] as string[],
  });

  const [pricingFormData, setPricingFormData] = useState<
    Record<string, string>
  >({});

  // Initialize form data when profile loads
  useEffect(() => {
    if (data) {
      const user = data.data.user;
      const vendorProfile =   user.vendor_profiles;
      setFormData({
        fullName: user.full_name || "",
        phone: vendorProfile?.contact_number || user.phone || "",
        businessName: vendorProfile?.business_name || "",
        bio: vendorProfile?.bio || "",
        primaryLocation: vendorProfile?.primary_location || "",
        whatsappNumber: vendorProfile?.whatsapp_number || "",
        contactNumber: vendorProfile?.contact_number || "",
        websiteUrl: vendorProfile?.website_url || "",
        instagramUrl: vendorProfile?.instagram_url || "",
        facebookUrl: vendorProfile?.facebook_url || "",
        serviceTypes: (vendorProfile as any)?.service_types || [],
      });
    }
  }, [data]);

  // Initialize pricing form data
  useEffect(() => {
    if (pricingData) {
      const pricingMap: Record<string, string> = {};
      pricingData.data.pricing.forEach(
        (p: { serviceType: string; price: number | null }) => {
          if (p.price) {
            pricingMap[p.serviceType] = p.price.toString();
          }
        }
      );
      setPricingFormData(pricingMap);
    }
  }, [pricingData]);

  if (isLoading) {
    return (
      <VendorLayout>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </VendorLayout>
    );
  }

  if (isError || !data) {
    return (
      <VendorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load profile</p>
            <p className="text-gray-600 text-sm">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </VendorLayout>
    );
  }

  const user = data.data.user;
  const vendorProfile = Array.isArray(user.vendor_profiles) ? user.vendor_profiles[0] : user.vendor_profiles;
  const serviceTypes = serviceTypesData?.data?.serviceTypes || [];
  const vendorServiceTypes = vendorProfile?.service_types || [];
  const pricing = pricingData?.data?.pricing || [];

  // Filter service types to only show what vendor offers
  const availableServiceTypes = serviceTypes.filter((st) => {
    const normalizedName = st.name.replace(/-/g, '_');
    return vendorServiceTypes.some((vst: string) => vst.replace(/-/g, '_') === normalizedName);
  });
  const handleEdit = (field: string) => {
    setEditingField(field);
  };

  const handleCancel = () => {
    setEditingField(null);
    // Reset form data
    if (data) {
      const user = data.data.user;
      const vendorProfile = Array.isArray(user.vendor_profiles) ? user.vendor_profiles[0] : user.vendor_profiles;
      setFormData({
        fullName: user.full_name || "",
        phone: vendorProfile?.contact_number || user.phone || "",
        businessName: vendorProfile?.business_name || "",
        bio: vendorProfile?.bio || "",
        primaryLocation: vendorProfile?.primary_location || "",
        whatsappNumber: vendorProfile?.whatsapp_number || "",
        contactNumber: vendorProfile?.contact_number || "",
        websiteUrl: vendorProfile?.website_url || "",
        instagramUrl: vendorProfile?.instagram_url || "",
        facebookUrl: vendorProfile?.facebook_url || "",
        serviceTypes: (vendorProfile as any)?.service_types || [],
      });
    }
  };

  const handleSave = async (field: string) => {
    try {
      const updateData: Record<string, string | number | string[] | undefined> =
        {};

      if (field === "fullName") {
        updateData.fullName = formData.fullName;
      } else if (field === "phone") {
        updateData.phone = formatPhoneForWhatsApp(formData.phone);
        setFormData(prev => ({ ...prev, phone: updateData.phone as string }));
      } else if (field === "businessName") {
        updateData.businessName = formData.businessName;
      } else if (field === "bio") {
        updateData.bio = formData.bio;
      } else if (field === "primaryLocation") {
        updateData.primaryLocation = formData.primaryLocation;
      } else if (field === "whatsappNumber") {
        updateData.whatsappNumber = formatPhoneForWhatsApp(formData.whatsappNumber);
        setFormData(prev => ({ ...prev, whatsappNumber: updateData.whatsappNumber as string }));
      } else if (field === "contactNumber") {
        updateData.contactNumber = formatPhoneForWhatsApp(formData.contactNumber);
        setFormData(prev => ({ ...prev, contactNumber: updateData.contactNumber as string }));
      } else if (field === "websiteUrl") {
        updateData.websiteUrl = formData.websiteUrl;
      } else if (field === "instagramUrl") {
        updateData.instagramUrl = formData.instagramUrl;
      } else if (field === "facebookUrl") {
        updateData.facebookUrl = formData.facebookUrl;
      }

      await updateProfileMutation.mutateAsync(updateData);
      setEditingField(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveServiceTypes = async (newTypes: string[]) => {
    try {
      await updateProfileMutation.mutateAsync({ serviceTypes: newTypes });
      setEditingField(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handlePricingChange = (serviceType: string, value: string) => {
    setPricingFormData((prev) => ({
      ...prev,
      [serviceType]: value,
    }));
  };

  const handleSavePricing = async (serviceType: string) => {
    const price = parseFloat(pricingFormData[serviceType]);
    if (isNaN(price) || price <= 0) {
      showToast.error("Invalid price", "Price must be a positive number");
      return;
    }

    try {
      await updatePricingMutation.mutateAsync({ serviceType, price });
    } catch {
      // Error handled by mutation
    }
  };

  const getServiceDisplayName = (serviceName: string) => {
    const normalizedServiceName = serviceName.replace(/-/g, '_');
    const serviceType = serviceTypes.find((st) => st.name.replace(/-/g, '_') === normalizedServiceName);
    return serviceType?.display_name || serviceName;
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* My Profile Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
            <button
              onClick={() => navigate("/vendor/dashboard/portfolio")}
              className="text-sm hover:text-gray-600 text-primary border-2 font-medium p-2 rounded-md"
            >
              Upload Portfolio
            </button>
          </div>

          <div className="flex items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.full_name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-gray-400">
                    {user.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary/90 transition-colors cursor-pointer">
               {uploadProfilePictureMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin " /> : <Camera className="w-4 h-4" />}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (5MB max)
                      const maxSize = 5 * 1024 * 1024; // 5MB
                      if (file.size > maxSize) {
                        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                        showToast.error(
                          "Image too large",
                          `Image size is ${fileSizeMB}MB. Maximum allowed size is 5MB. Please select a smaller image.`
                        );
                        // Reset the input
                        e.target.value = "";
                        return;
                      }
                      // Validate file type
                      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                      if (!validTypes.includes(file.type)) {
                        showToast.error("Invalid file type", "Please select a JPEG, PNG, or WebP image");
                        // Reset the input
                        e.target.value = "";
                        return;
                      }
                      uploadProfilePictureMutation.mutate(file);
                    }
                  }}
                  disabled={uploadProfilePictureMutation.isPending}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-primary mb-2">
                {formData.businessName ||
                  vendorProfile?.business_name ||
                  formData.fullName ||
                  user.full_name ||
                  "Vendor"}
              </h3>
              <p className="text-gray-700 mb-1">
                {vendorProfile?.service_types
                  ?.map((st: string) => getServiceDisplayName(st))
                  .join(", ") || "Vendor"}
              </p>
              <p className="text-gray-600 text-sm">
                {formData.primaryLocation ||
                  vendorProfile?.primary_location ||
                  "Location not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-primary mb-6">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Business Name</label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessName: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "businessName"}
                  className={
                    editingField === "businessName"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "businessName" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("businessName")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("businessName")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Full Name</label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "fullName"}
                  className={
                    editingField === "fullName"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "fullName" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("fullName")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("fullName")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">E-Mail address</label>
              <Input
                value={user.email || ""}
                readOnly
                className="border-gray-200 bg-gray-50"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Phone number</label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  readOnly={editingField !== "phone"}
                  className={
                    editingField === "phone" ? "" : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "phone" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("phone")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("phone")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-gray-500">Bio</label>
              <div className="flex items-start gap-2">
                <Textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  readOnly={editingField !== "bio"}
                  className={
                    editingField === "bio" ? "" : "border-gray-200 bg-gray-50"
                  }
                  rows={3}
                />
                {editingField === "bio" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("bio")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("bio")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Primary Location */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Primary Location</label>
              <div className="flex items-center gap-2">
                <Input
                  value={formData.primaryLocation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      primaryLocation: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "primaryLocation"}
                  className={
                    editingField === "primaryLocation"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "primaryLocation" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("primaryLocation")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("primaryLocation")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">WhatsApp Number</label>
              <div className="flex items-center gap-2">
                <Input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      whatsappNumber: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "whatsappNumber"}
                  className={
                    editingField === "whatsappNumber"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "whatsappNumber" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("whatsappNumber")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("whatsappNumber")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Contact Number</label>
              <div className="flex items-center gap-2">
                <Input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactNumber: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "contactNumber"}
                  className={
                    editingField === "contactNumber"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "contactNumber" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("contactNumber")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("contactNumber")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Website</label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      websiteUrl: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "websiteUrl"}
                  className={
                    editingField === "websiteUrl"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "websiteUrl" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("websiteUrl")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("websiteUrl")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Instagram */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Instagram URL</label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      instagramUrl: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "instagramUrl"}
                  className={
                    editingField === "instagramUrl"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "instagramUrl" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("instagramUrl")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("instagramUrl")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Facebook */}
            <div className="space-y-1">
              <label className="text-sm text-gray-500">Facebook URL</label>
              <div className="flex items-center gap-2">
                <Input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      facebookUrl: e.target.value,
                    }))
                  }
                  readOnly={editingField !== "facebookUrl"}
                  className={
                    editingField === "facebookUrl"
                      ? ""
                      : "border-gray-200 bg-gray-50"
                  }
                />
                {editingField === "facebookUrl" ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSave("facebookUrl")}
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit("facebookUrl")}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Service Pricing Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary">Service Pricing</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingField("serviceTypes")}
            >
              <Edit className="w-4 h-4 mr-2" />
              Manage Services
            </Button>
          </div>

          {/* Service Types Selection Modal */}
          {editingField === "serviceTypes" && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300 shadow-inner">
              <h4 className="font-bold text-gray-900 mb-3">Update Services You Offer</h4>
              <p className="text-sm text-gray-600 mb-4">
                Select the services you want to provide. Once saved, you can set pricing for each.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {serviceTypes.filter((st: any) => st.is_active).map((st: any) => {
                  const normalizedStName = st.name.replace(/-/g, '_');
                  const isSelected = ((formData as any).serviceTypes ?? vendorServiceTypes).some((t: string) => t.replace(/-/g, '_') === normalizedStName);
                  return (
                    <label
                      key={st.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "border-primary bg-primary/10 shadow-sm" 
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentTypes = (formData as any).serviceTypes ?? vendorServiceTypes;
                          const newTypes = e.target.checked
                            ? [...currentTypes.filter((t: string) => t.replace(/-/g, '_') !== normalizedStName), st.name]
                            : currentTypes.filter((t: string) => t.replace(/-/g, '_') !== normalizedStName);
                          
                          setFormData(prev => ({
                            ...prev,
                            serviceTypes: newTypes
                          }));
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-gray-700"}`}>
                        {st.display_name}
                      </span>
                    </label>
                  );
                })}
              </div>


              <div className="flex justify-end gap-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setEditingField(null);
                    // Reset serviceTypes in formData
                    const { serviceTypes: _, ...rest } = formData as any;
                    setFormData(rest);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSaveServiceTypes((formData as any).serviceTypes || vendorServiceTypes)}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}

          {availableServiceTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No services configured. Click "Manage Services" to add service types.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableServiceTypes.map((serviceType: any) => {
                const currentPricing = pricing.find(
                  (p: { serviceType: string; price: number | null }) =>
                    p.serviceType === serviceType.name
                );
                const currentPrice =
                  pricingFormData[serviceType.name] ||
                  currentPricing?.price?.toString() ||
                  "";
                const isEditing =
                  editingField === `pricing_${serviceType.name}`;

                return (
                  <div key={serviceType.id} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {serviceType.display_name}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          ₦
                        </span>
                        <Input
                          type="number"
                          value={
                            isEditing
                              ? pricingFormData[serviceType.name] || ""
                              : currentPrice
                          }
                          onChange={(e) =>
                            handlePricingChange(
                              serviceType.name,
                              e.target.value
                            )
                          }
                          readOnly={!isEditing}
                          className={
                            isEditing
                              ? "pl-8"
                              : "pl-8 border-gray-200 bg-gray-50"
                          }
                          placeholder="Enter price"
                        />
                      </div>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleSavePricing(serviceType.name);
                              setEditingField(null);
                            }}
                            disabled={updatePricingMutation.isPending}
                          >
                            {updatePricingMutation.isPending ? (
                              <Loader size="sm" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingField(null);
                              setPricingFormData((prev) => {
                                const newData = { ...prev };
                                delete newData[serviceType.name];
                                return newData;
                              });
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingField(`pricing_${serviceType.name}`);
                            if (
                              !pricingFormData[serviceType.name] &&
                              currentPrice
                            ) {
                              setPricingFormData((prev) => ({
                                ...prev,
                                [serviceType.name]: currentPrice,
                              }));
                            }
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
