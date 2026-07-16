import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { excludedBranchesApi } from "./excluded-branches.api";
import { excludedBranchesKeys } from "./excluded-branches.keys";

export const useExcludedBranches = () =>
  useQuery({
    queryKey: excludedBranchesKeys.all,
    queryFn: excludedBranchesApi.list,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateExcludedBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, reason }: { branchId: number; reason?: string }) =>
      excludedBranchesApi.create(branchId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: excludedBranchesKeys.all });
      qc.invalidateQueries({ queryKey: ["branch-checklist"] });
    },
  });
};

export const useDeleteExcludedBranch = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excludedBranchesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: excludedBranchesKeys.all });
      qc.invalidateQueries({ queryKey: ["branch-checklist"] });
    },
  });
};
