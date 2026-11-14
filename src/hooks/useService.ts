import { useQuery } from "@tanstack/react-query";
import { serviceService } from "@/services/api/service.service";

export const useServiceTypes = () => {
  return useQuery({
    queryKey: ["services", "types"],
    queryFn: () => serviceService.getServiceTypes(),
  });
};

