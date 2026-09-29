import { useMemo } from "react";
import { useExcludedBranches } from "@/features/branches/checklist/api/excluded-branches.queries";
import type { ExcludedBranch } from "@/features/branches/checklist/types/excluded-branch.types";
import { useBranches } from "./branch.queries";
import type { Branch } from "./types";

export const activeBranches = (
  branches: Branch[],
  excluded: ExcludedBranch[],
): Branch[] => {
  if (excluded.length === 0) return branches;
  const excludedIds = new Set(excluded.map((item) => item.branchId));
  return branches.filter((branch) => !excludedIds.has(branch.id));
};

export const useReportBranches = () => {
  const branchesQuery = useBranches();
  const excludedQuery = useExcludedBranches();

  const branches = useMemo(
    () => activeBranches(branchesQuery.data ?? [], excludedQuery.data ?? []),
    [branchesQuery.data, excludedQuery.data],
  );

  return {
    branches,
    excluded: excludedQuery.data ?? [],
    isLoading: branchesQuery.isLoading || excludedQuery.isLoading,
  };
};
