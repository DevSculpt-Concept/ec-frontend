import { useQuery, useMutation } from "@tanstack/react-query";
import { searchService, type SearchFilters } from "@/services/api/search.service";

export const useSearchVendors = (filters: SearchFilters = {}) => {
  return useQuery({
    queryKey: ["vendors", "search", filters],
    queryFn: () => searchService.searchVendors(filters),
    enabled: true,
  });
};

export const useVendorDetails = (vendorId: string | null) => {
  return useQuery({
    queryKey: ["vendors", vendorId],
    queryFn: () => searchService.getVendorDetails(vendorId!),
    enabled: !!vendorId,
  });
};

export const useCheckVendorAvailability = () => {
  return useMutation({
    mutationFn: ({ 
      vendorId, 
      date, 
      startTime, 
      endTime 
    }: { 
      vendorId: string; 
      date: string; 
      startTime?: string; 
      endTime?: string;
    }) =>
      searchService.checkVendorAvailability(vendorId, date, startTime, endTime),
  });
};

export const useFilterOptions = () => {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: () => searchService.getFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

