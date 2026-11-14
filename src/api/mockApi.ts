import type { Service, Stats, Vendor } from "@/data/mockData";
import { services, stats, vendors } from "@/data/mockData";

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  // Get all services
  getServices: async (): Promise<Service[]> => {
    await delay(500);
    return services;
  },

  // Get all vendors
  getVendors: async (): Promise<Vendor[]> => {
    await delay(800);
    return vendors;
  },

  // Get vendors by service type
  getVendorsByService: async (serviceType: string): Promise<Vendor[]> => {
    await delay(800);
    return vendors.filter(
      (vendor) => vendor.serviceType.toLowerCase() === serviceType.toLowerCase()
    );
  },

  // Search vendors with filters
  searchVendors: async (filters: {
    eventType?: string;
    serviceType?: string;
    location?: string;
  }): Promise<Vendor[]> => {
    await delay(1000);

    let results = vendors;

    if (filters.serviceType && filters.serviceType !== "all") {
      results = results.filter((vendor) =>
        vendor.serviceType
          .toLowerCase()
          .includes(filters.serviceType!.toLowerCase())
      );
    }

    if (filters.location) {
      results = results.filter((vendor) =>
        vendor.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    return results;
  },

  // Get vendor by ID
  getVendorById: async (id: string): Promise<Vendor | undefined> => {
    await delay(500);
    return vendors.find((vendor) => vendor.id === id);
  },

  // Get stats
  getStats: async (): Promise<Stats[]> => {
    await delay(300);
    return stats;
  },
};
