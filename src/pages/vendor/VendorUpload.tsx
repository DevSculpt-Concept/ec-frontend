import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  Eye,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePortfolioItem } from "@/hooks/useVendor";
import { useServiceTypes } from "@/hooks/useService";
import { useVendorProfile } from "@/hooks/useVendor";
import { showToast } from "@/lib/toast";

export function VendorUpload() {
  const navigate = useNavigate();
  const { data: vendorProfileData } = useVendorProfile();
  const { data: serviceTypesData } = useServiceTypes();
  const createPortfolioMutation = useCreatePortfolioItem();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cost: "",
    youtubeUrl: "",
    serviceType: "",
  });

  const vendorProfile = vendorProfileData?.data?.user?.vendor_profiles;
  const vendorProfileObj = Array.isArray(vendorProfile) ? vendorProfile[0] : vendorProfile;
  const vendorServiceTypes = vendorProfileObj?.service_types || [];
  const serviceTypes = serviceTypesData?.data?.serviceTypes || [];

  // Filter service types to only show what vendor offers
  const availableServiceTypes = serviceTypes.filter((st) => {
    const normalizedName = st.name.replace(/-/g, '_');
    return vendorServiceTypes.some((vst: string) => vst.replace(/-/g, '_') === normalizedName);
  });

  // Initialize service type if only one is available
  useEffect(() => {
    if (availableServiceTypes.length === 1 && !formData.serviceType) {
      setFormData((prev) => ({
        ...prev,
        serviceType: availableServiceTypes[0].name,
      }));
    }
  }, [availableServiceTypes.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (20MB max)
      if (file.size > 20 * 1024 * 1024) {
        showToast.error("File too large", "Please select a file smaller than 20MB");
        return;
      }

      // Validate file type
      const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
      const isValidType = validImageTypes.includes(file.type) || validVideoTypes.includes(file.type);

      if (!isValidType) {
        showToast.error(
          "Invalid file type",
          "Please select an image (JPEG, PNG, WebP) or video (MP4, MOV, AVI)"
        );
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,video/*";
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast.error("No file selected", "Please select an image or video file");
      return;
    }

    if (!formData.title.trim()) {
      showToast.error("Title required", "Please enter a title for your portfolio item");
      return;
    }

    if (!formData.serviceType) {
      showToast.error("Service type required", "Please select a service type");
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("media", selectedFile);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description || "");
      uploadFormData.append("serviceType", formData.serviceType);
      
      if (formData.cost) {
        uploadFormData.append("cost", formData.cost);
      }
      
      if (formData.youtubeUrl) {
        uploadFormData.append("youtubeUrl", formData.youtubeUrl);
      }

      await createPortfolioMutation.mutateAsync(uploadFormData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        cost: "",
        youtubeUrl: "",
        serviceType: formData.serviceType, // Keep service type
      });
      handleRemoveFile();
      
      // Navigate to portfolio page
      navigate("/vendor/dashboard/portfolio");
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!serviceTypesData || !vendorProfileData) {
    return (
      <VendorLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Sub-navigation */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => navigate("/vendor/dashboard/profile")}
            className="text-gray-500 hover:text-gray-700"
          >
            My Profile
          </button>
          <button
            onClick={() => navigate("/vendor/dashboard/portfolio")}
            className="text-gray-500 hover:text-gray-700"
          >
            Upload Portfolio
          </button>
          <button className="text-gray-900 font-semibold border-b-2 border-primary pb-2">
            Add More to Portfolio
          </button>
        </div>

        {/* Page Title */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900">Upload Your Files</h2>
          <p className="text-sm text-primary mt-1">
            Provide information about your uploads
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - File Upload */}
              <div>
                {/* Large Upload Area */}
                {!previewUrl ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-16 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-700 font-medium text-base mb-2">
                        Select File or Drag & Drop
                      </p>
                      <p className="text-sm text-gray-500">
                        Images (JPEG, PNG, WebP) or Videos (MP4, MOV, AVI)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max size: 20MB</p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    {selectedFile?.type.startsWith("image/") ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        className="w-full h-64 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="mt-2 text-sm text-gray-600">
                      {selectedFile?.name} ({(selectedFile?.size || 0) / 1024 / 1024} MB)
                    </div>
                  </div>
                )}

                {/* File Preview Thumbnails - Removed for single file upload */}
              </div>

              {/* Right Column - Form Fields */}
              <div className="space-y-5">
                {/* Portfolio Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter upload title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border-gray-300"
                    required
                  />
                </div>

                {/* Upload Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Description
                  </label>
                  <Textarea
                    placeholder="Describe your work..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="min-h-[100px]"
                    rows={4}
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.serviceType}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceType: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select a service type</option>
                      {availableServiceTypes.map((st) => (
                        <option key={st.id} value={st.name}>
                          {st.display_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost (Optional)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-700">
                      ₦
                    </span>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({ ...formData, cost: e.target.value })
                      }
                      className="rounded-l-none border-gray-300"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Youtube Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Link (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.youtubeUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeUrl: e.target.value })
                    }
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center gap-6">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-medium"
                disabled={createPortfolioMutation.isPending}
              >
                {createPortfolioMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
              <button
                type="button"
                onClick={() => navigate("/vendor/dashboard/portfolio")}
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
              >
                <Eye className="w-4 h-4" />
                <span>View Portfolio</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </VendorLayout>
  );
}
