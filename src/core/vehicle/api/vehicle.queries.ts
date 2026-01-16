import { useQuery } from "@tanstack/react-query";
import { vehicleApi } from "@/core/vehicle/api/vehicle.api";

export const useVehicles = () =>
  useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleApi.getAll,
  });
