import { useQuery } from "@tanstack/react-query";
import * as api from "@/features/branches/branchsupplier/branch.supplier.api";
import { branchSupplierKeys } from "./branch.supplier.keys";

export const useBranchSuppliers = () => {
  return useQuery({
    queryKey: branchSupplierKeys.lists(),
    queryFn: api.getBranchSuppliers,
    // La lista de proveedores se mantiene fresca por 10 minutos
    staleTime: 1000 * 60 * 10,
    // Mantenemos los datos en caché aunque no se usen por 30 mins
    gcTime: 1000 * 60 * 30,
  });
};
