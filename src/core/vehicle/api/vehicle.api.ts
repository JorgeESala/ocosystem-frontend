import { http } from "@/shared/api/http";
import { VehicleResponseDTO } from "@/core/api/types";

export const vehicleApi = {
  getAll: async (): Promise<VehicleResponseDTO[]> => {
    const { data } = await http.get("/api/vehicles");
    return data;
  },
};
