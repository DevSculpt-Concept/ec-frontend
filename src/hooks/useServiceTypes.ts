import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceTypesService } from "@/services/api/service-types.service";
import { showToast } from "@/lib/toast";

// ============================================
//   SERVICE TYPES HOOKS
// ============================================

export const useAllServiceTypes = (includeInactive = false) => {
  return useQuery({
    queryKey: ["admin", "service-types", includeInactive],
    queryFn: () => serviceTypesService.getAllServiceTypes(includeInactive),
  });
};

export const useServiceType = (id: string) => {
  return useQuery({
    queryKey: ["admin", "service-types", id],
    queryFn: () => serviceTypesService.getServiceType(id),
    enabled: !!id,
  });
};

export const useServiceTypeStatistics = () => {
  return useQuery({
    queryKey: ["admin", "service-types", "statistics"],
    queryFn: () => serviceTypesService.getStatistics(),
  });
};

export const useCreateServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      displayName: string;
      description?: string;
      iconUrl?: string;
      displayOrder?: number;
    }) => serviceTypesService.createServiceType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "service-types"] });
      queryClient.invalidateQueries({ queryKey: ["services", "types"] });
      showToast.success("Service type created successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to create service type", error.message);
    },
  });
};

export const useUpdateServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        displayName?: string;
        description?: string;
        iconUrl?: string;
        displayOrder?: number;
        isActive?: boolean;
      };
    }) => serviceTypesService.updateServiceType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "service-types"] });
      queryClient.invalidateQueries({ queryKey: ["services", "types"] });
      showToast.success("Service type updated successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to update service type", error.message);
    },
  });
};

export const useDeleteServiceType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceTypesService.deleteServiceType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "service-types"] });
      queryClient.invalidateQueries({ queryKey: ["services", "types"] });
      showToast.success("Service type deleted successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to delete service type", error.message);
    },
  });
};

export const useReorderServiceTypes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceTypeOrders: { id: string; displayOrder: number }[]) =>
      serviceTypesService.reorderServiceTypes(serviceTypeOrders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "service-types"] });
      showToast.success("Service types reordered successfully");
    },
    onError: (error: Error) => {
      showToast.error("Failed to reorder service types", error.message);
    },
  });
};

// Public hook for getting active service types (used in vendor creation)
export const useActiveServiceTypes = () => {
  return useQuery({
    queryKey: ["services", "types"],
    queryFn: () => serviceTypesService.getActiveServiceTypes(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

