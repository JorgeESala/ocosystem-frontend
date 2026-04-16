import { useQuery } from "@tanstack/react-query";
import * as api from "@/core/supplier/supplier.api";
export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: api.getSuppliers,
    staleTime: 1000 * 60 * 5,
  });
};
