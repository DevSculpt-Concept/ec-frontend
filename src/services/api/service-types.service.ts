import { http } from "@/lib/http";

export interface ServiceType {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  vendorCount?: number;
}

export interface ServiceTypeStatistics {
  id: string;
  name: string;
  displayName: string;
  vendorCount: number;
  bookingCount: number;
}

export const serviceTypesService = {
  getAllServiceTypes: async (includeInactive = false): Promise<{ data: { serviceTypes: ServiceType[]; total: number } }> => {
    const res = await http.get<{ serviceTypes: ServiceType[]; total: number }>("/service-types", {
      includeInactive: includeInactive ? "true" : undefined,
    });
    return { data: res.data };
  },

  getServiceType: async (id: string): Promise<{ data: ServiceType }> => {
    const res = await http.get<ServiceType>(`/service-types/${id}`);
    return { data: res.data };
  },

  getStatistics: async (): Promise<{ data: { statistics: ServiceTypeStatistics[] } }> => {
    const res = await http.get<{ statistics: ServiceTypeStatistics[] }>("/service-types/statistics");
    return { data: res.data };
  },

  createServiceType: async (data: { name: string; displayName: string; description?: string; iconUrl?: string; displayOrder?: number }) => {
    const res = await http.post<ServiceType>("/service-types", data);
    return { data: res.data };
  },

  updateServiceType: async (id: string, data: { name?: string; displayName?: string; description?: string; iconUrl?: string; displayOrder?: number; isActive?: boolean }) => {
    const res = await http.patch<ServiceType>(`/service-types/${id}`, data);
    return { data: res.data };
  },

  deleteServiceType: async (id: string) => {
    await http.delete(`/service-types/${id}`);
    return { data: null };
  },

  reorderServiceTypes: async (serviceTypeOrders: { id: string; displayOrder: number }[]) => {
    await http.put("/service-types/reorder", { serviceTypeOrders });
    return { data: null };
  },

  getActiveServiceTypes: async (): Promise<{ data: { serviceTypes: ServiceType[] } }> => {
    const res = await http.get<{ serviceTypes: ServiceType[] }>("/service-types/active");
    return { data: res.data };
  },
};

export default serviceTypesService;
