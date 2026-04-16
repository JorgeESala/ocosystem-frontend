import { useQuery } from "@tanstack/react-query";
import { branchKeys } from "./branch.keys";
import * as api from "@/features/branches/branch/branch.api";
export const useBranches = () => {
  return useQuery({
    queryKey: branchKeys.lists(),
    queryFn: api.getBranches,
    // Como las sucursales no cambian seguido, podemos darles un staleTime largo
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useBranch = (id: number) => {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => api.getBranchById(id),
    enabled: !!id,
  });
};
