import { useQuery } from "@tanstack/react-query";
import type { BranchProfitFilters } from "../types";
import { branchProfitApi } from "./branch-profit.api";
import { branchProfitKeys } from "./branch-profit.keys";

export const useBranchProfitReport = (filters: BranchProfitFilters | null) =>
  useQuery({
    queryKey: filters
      ? branchProfitKeys.report(
          [...filters.branchIds].sort((a, b) => a - b),
          filters.startDate.toISOString(),
          filters.endDate.toISOString(),
        )
      : [...branchProfitKeys.all, "report", "disabled"] as const,
    queryFn: () => branchProfitApi.getReport(filters!),
    enabled: Boolean(filters && filters.branchIds.length > 0),
  });

