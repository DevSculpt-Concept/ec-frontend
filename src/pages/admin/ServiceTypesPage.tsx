import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { adminNavItems } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  X,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Image,
} from "lucide-react";
import { useState } from "react";
import { showToast } from "@/lib/toast";
import {
  useAllServiceTypes,
  useServiceTypeStatistics,
  useCreateServiceType,
  useUpdateServiceType,
  useDeleteServiceType,
} from "@/hooks/useServiceTypes";
import type { ServiceType, ServiceTypeStatistics } from "@/services/api/service-types.service";

type ModalMode = "create" | "edit" | null;

const initialFormData = {
  name: "",
  displayName: "",
  description: "",
  iconUrl: "",
  displayOrder: 0,
  isActive: true,
};

export function ServiceTypesPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceType | null>(null);

  // Queries
  const { data: serviceTypesData, isLoading: typesLoading, refetch } = useAllServiceTypes(showInactive);
  const { data: statisticsData, isLoading: statsLoading } = useServiceTypeStatistics();

  // Mutations
  const createMutation = useCreateServiceType();
  const updateMutation = useUpdateServiceType();
  const deleteMutation = useDeleteServiceType();

  const serviceTypes = serviceTypesData?.data?.serviceTypes || [];
  const statistics = statisticsData?.data?.statistics || [];

  // Filter service types by search term
  const filteredTypes = serviceTypes.filter(
    (type) =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get statistics for a service type
  const getStats = (name: string): ServiceTypeStatistics | undefined => {
    return statistics.find((s) => s.name === name);
  };

  const handleOpenCreateModal = () => {
    setFormData(initialFormData);
    setSelectedServiceType(null);
    setModalMode("create");
  };

  const handleOpenEditModal = (serviceType: ServiceType) => {
    setFormData({
      name: serviceType.name,
      displayName: serviceType.display_name,
      description: serviceType.description || "",
      iconUrl: serviceType.icon_url || "",
      displayOrder: serviceType.display_order,
      isActive: serviceType.is_active ?? true,
    });
    setSelectedServiceType(serviceType);
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedServiceType(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.displayName) {
      showToast.error("Name and Display Name are required");
      return;
    }

    if (modalMode === "create") {
      await createMutation.mutateAsync({
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description || undefined,
        iconUrl: formData.iconUrl || undefined,
        displayOrder: formData.displayOrder,
      });
    } else if (modalMode === "edit" && selectedServiceType) {
      await updateMutation.mutateAsync({
        id: selectedServiceType.id,
        data: {
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description || undefined,
          iconUrl: formData.iconUrl || undefined,
          displayOrder: formData.displayOrder,
          isActive: formData.isActive,
        },
      });
    }

    handleCloseModal();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    await deleteMutation.mutateAsync(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (serviceType: ServiceType) => {
    await updateMutation.mutateAsync({
      id: serviceType.id,
      data: { isActive: !serviceType.is_active },
    });
  };

  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Types</h1>
            <p className="text-gray-600 mt-1">Manage the service types vendors can offer</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleOpenCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service Type
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search service types..."
              className="pl-10"
            />
          </div>
          <Button
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
            size="sm"
          >
            {showInactive ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showInactive ? "Showing All" : "Show Inactive"}
          </Button>
        </div>

        {/* Statistics Summary */}
        {!statsLoading && statistics.length > 0 && (
          <div className="grid sm:grid-cols-2  gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Service Types</p>
              <p className="text-2xl font-bold text-gray-900">{serviceTypes.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Active Types</p>
              <p className="text-2xl font-bold text-green-600">
                {serviceTypes.filter((t) => t.is_active).length}
              </p>
            </div>
            {/* <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Vendors</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.reduce((sum, s) => sum + s.vendorCount, 0)}
              </p>
            </div> */}

          </div>
        )}

        {/* Service Types List */}
        {typesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Types Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "No service types match your search." : "Get started by creating your first service type."}
            </p>
            {!searchTerm && (
              <Button onClick={handleOpenCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service Type
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  {/* <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Vendors</th> */}
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.map((serviceType) => {
                  const stats = getStats(serviceType.name);
                  return (
                    <tr
                      key={serviceType.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${!serviceType.is_active ? "opacity-60" : ""
                        }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          <span className="text-sm font-medium text-gray-500">
                            {serviceType.display_order}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {serviceType.icon_url ? (
                            <img
                              src={serviceType.icon_url}
                              alt={serviceType.display_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Image className="w-5 h-5 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{serviceType.display_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{serviceType.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {serviceType.description || "-"}
                        </p>
                      </td>
                      {/* <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-900">{stats?.vendorCount || 0}</span>
                        </div>
                      </td> */}

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(serviceType)}
                          disabled={updateMutation.isPending}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${serviceType.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                          {serviceType.is_active ? (
                            <>
                              <Check className="w-3 h-3" /> Active
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(serviceType)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(serviceType)}
                            disabled={stats && stats.vendorCount > 0}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalMode !== null} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === "create" ? "Create Service Type" : "Edit Service Type"}
            </DialogTitle>
            <DialogDescription>
              {modalMode === "create"
                ? "Add a new service type that vendors can offer."
                : "Update the service type details."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.displayName}
                onChange={(e) => {
                  const displayName = e.target.value;
                  const autoName = displayName.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                  setFormData({
                    ...formData,
                    displayName,
                    name: autoName,
                  });
                }}
                placeholder="e.g., Photography, Catering Services"
              />
            </div>

            <div className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Name (auto-generated)
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""),
                  })
                }
                placeholder="Auto-generated from display name"
                className="font-mono text-sm bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used internally. Auto-generated but can be modified.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this service type..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
              <Input
                value={formData.iconUrl}
                onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                placeholder="https://example.com/icon.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
            </div>

            {modalMode === "edit" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible to vendors)
                </label>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : modalMode === "create"
                    ? "Create"
                    : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirm?.display_name}"? This will deactivate the
              service type.
            </DialogDescription>
          </DialogHeader>

          {deleteConfirm && getStats(deleteConfirm.name)?.vendorCount! > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ This service type has {getStats(deleteConfirm.name)?.vendorCount} vendor(s) using
                it. Remove it from all vendors before deleting.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteMutation.isPending ||
                !!(deleteConfirm && (getStats(deleteConfirm.name)?.vendorCount || 0) > 0)
              }
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

