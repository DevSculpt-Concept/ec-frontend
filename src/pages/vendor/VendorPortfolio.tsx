import { VendorLayout } from "@/components/layout/VendorLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Trash2,
  Image as ImageIcon,
  Video,
  Star,
  Heart,
  Eye,
  Plus,
  Filter,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useVendorPortfolio,
  useDeletePortfolioItem,
  useUpdatePortfolioItem,
  useVendorProfile,
} from "@/hooks/useVendor";
import { useServiceTypes } from "@/hooks/useService";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function VendorPortfolio() {
  const navigate = useNavigate();
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
  } = useVendorProfile();

  const [activeType, setActiveType] = useState<"all" | "image" | "video">(
    "all"
  );
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const limit = 20;

  const { data, isLoading, isError, error } = useVendorPortfolio(
    serviceFilter || undefined,
    activeType === "all" ? undefined : activeType,
    page,
    limit
  );
  const { data: serviceTypesData } = useServiceTypes();
  const deletePortfolioMutation = useDeletePortfolioItem();
  const updatePortfolioMutation = useUpdatePortfolioItem();

  const portfolioItems = data?.data?.items || [];
  const pagination = data?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };
  
  const vendorProfile = profileData?.data?.user?.vendor_profiles;
  const vendorProfileObj = Array.isArray(vendorProfile) ? vendorProfile[0] : vendorProfile;
  const vendorServiceTypes = vendorProfileObj?.service_types || [];
  const serviceTypes = serviceTypesData?.data?.serviceTypes || [];
  
  // Filter service types to only show what vendor offers
  const availableServiceTypes = serviceTypes.filter((st) => {
    const normalizedName = st.name.replace(/-/g, '_');
    return vendorServiceTypes.some((vst: string) => vst.replace(/-/g, '_') === normalizedName);
  });

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    cost: "",
    youtubeUrl: "",
    serviceType: "",
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);

  // Initialize edit form when item is selected
  useEffect(() => {
    if (editingItem) {
      setEditFormData({
        title: editingItem.title || "",
        description: editingItem.description || "",
        cost: editingItem.cost?.toString() || "",
        youtubeUrl: editingItem.youtube_url || "",
        serviceType: editingItem.service_type || "",
      });
      setEditFile(null);
      setEditPreviewUrl(null);
    }
  }, [editingItem]);

  const handleDelete = async (portfolioId: string) => {
    if (!confirm("Are you sure you want to delete this portfolio item?")) {
      return;
    }

    try {
      await deletePortfolioMutation.mutateAsync(portfolioId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = (item: {
    id: string;
    title: string;
    description?: string;
    cost?: number;
    youtube_url?: string;
    service_type: string;
  }) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setEditFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem) return;

    try {
      const formData = new FormData();
      
      if (editFile) {
        formData.append("media", editFile);
      }
      
      formData.append("title", editFormData.title);
      formData.append("description", editFormData.description || "");
      formData.append("serviceType", editFormData.serviceType);
      
      if (editFormData.cost) {
        formData.append("cost", editFormData.cost);
      }
      
      if (editFormData.youtubeUrl) {
        formData.append("youtubeUrl", editFormData.youtubeUrl);
      }

      await updatePortfolioMutation.mutateAsync({
        portfolioId: editingItem.id,
        formData,
      });
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      setEditFile(null);
      if (editPreviewUrl) {
        URL.revokeObjectURL(editPreviewUrl);
        setEditPreviewUrl(null);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getMediaTypeIcon = (mediaType: string) => {
    if (mediaType === "video") return <Video className="w-5 h-5" />;
    if (mediaType === "youtube") return <Video className="w-5 h-5" />;
    return <ImageIcon className="w-5 h-5" />;
  };

  const getServiceDisplayName = (serviceName: string) => {
    const normalizedServiceName = serviceName.replace(/-/g, '_');
    const serviceType = serviceTypes.find(
      (st: { id?: string; name: string; display_name?: string } | string) => {
        if (typeof st === 'string') return st.replace(/-/g, '_') === normalizedServiceName;
        return st.name.replace(/-/g, '_') === normalizedServiceName;
      }
    );
    if (typeof serviceType === 'string') return serviceName;
    return serviceType?.display_name || serviceName;
  };

  if (isLoading || profileLoading) {
    return (
      <VendorLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </VendorLayout>
    );
  }

  if (isError || profileError) {
    const errorMessage = isError && error instanceof Error ? error.message : "Unknown error occurred";
    return (
      <VendorLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load portfolio</h3>
            <p className="text-sm text-red-700">
              {errorMessage}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        </div>
      </VendorLayout>
    );
  }

  return (
    <VendorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Portfolio</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your portfolio items ({pagination.total} items)
            </p>
          </div>
          <Button
            onClick={() => navigate("/vendor/dashboard/upload")}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Media Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Type:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setActiveType("all");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeType === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setActiveType("image");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeType === "image"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Images
                </button>
                <button
                  onClick={() => {
                    setActiveType("video");
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    activeType === "video"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>

            {/* Service Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Service:
              </span>
              <select
                value={serviceFilter}
                onChange={(e) => {
                  setServiceFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg capitalize text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Services</option>
                {availableServiceTypes.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio Grid */}
        {portfolioItems.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No portfolio items yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your portfolio by uploading your best work
            </p>
            <Button
              onClick={() => navigate("/vendor/dashboard/upload")}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item: {
                id: string;
                title: string;
                description?: string;
                cost?: number;
                media_type: string;
                media_url?: string;
                youtube_url?: string;
                service_type: string;
                likes_count?: number;
                comments_count?: number;
                average_rating?: number;
              }) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Media */}
                  <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                    {item.media_type === "image" && item.media_url ? (
                      <img
                        src={item.media_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x300?text=Image+Not+Available";
                        }}
                      />
                    ) : item.media_type === "video" && item.media_url ? (
                      <video
                        src={item.media_url}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                      />
                    ) : item.media_type === "youtube" && item.youtube_url ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <Video className="w-16 h-16 text-white" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      {getMediaTypeIcon(item.media_type)}
                      <span className="capitalize">{item.media_type}</span>
                    </div>

                    {/* Stats Overlay */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3 bg-black/50 px-2 py-1 rounded">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{item.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{item.comments_count || 0}</span>
                        </div>
                        {(item.average_rating ?? 0) > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{(item.average_rating ?? 0).toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                      {item.description || "No description"}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {getServiceDisplayName(item.service_type)}
                      </span>
                      {item.cost && (
                        <span className="text-sm font-semibold text-gray-900">
                          ₦ {item.cost.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletePortfolioMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Portfolio Item</DialogTitle>
            <DialogDescription>
              Update your portfolio item details. Leave fields empty to keep current values.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-6">
            {/* File Upload (Optional - only if changing media) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Media (Optional)
              </label>
              {editPreviewUrl ? (
                <div className="relative">
                  {editFile?.type.startsWith("image/") ? (
                    <img
                      src={editPreviewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={editPreviewUrl}
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditFile(null);
                      if (editPreviewUrl) {
                        URL.revokeObjectURL(editPreviewUrl);
                        setEditPreviewUrl(null);
                      }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-sm text-gray-600 mb-2">Current media will be kept</p>
                  <label className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90">
                    Select New File
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleEditFileChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, description: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type <span className="text-red-500">*</span>
              </label>
              <select
                value={editFormData.serviceType}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, serviceType: e.target.value })
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
                  value={editFormData.cost}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, cost: e.target.value })
                  }
                  className="rounded-l-none"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Link (Optional)
              </label>
              <Input
                type="url"
                value={editFormData.youtubeUrl}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, youtubeUrl: e.target.value })
                }
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={updatePortfolioMutation.isPending}
              >
                {updatePortfolioMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingItem(null);
                  setEditFile(null);
                  if (editPreviewUrl) {
                    URL.revokeObjectURL(editPreviewUrl);
                    setEditPreviewUrl(null);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </VendorLayout>
  );
}
