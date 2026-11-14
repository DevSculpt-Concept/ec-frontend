import { serviceTypesService } from "./service-types.service";

export const serviceService = {
  getServiceTypes: () => serviceTypesService.getAllServiceTypes(),
};
