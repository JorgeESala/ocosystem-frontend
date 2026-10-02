import { useQuery } from "@tanstack/react-query";
import { toLocalDateString } from "@/utils/date.utils";
import { fetchBranchesDashboard } from "./branchesDashboard.api";
import { branchesDashboardKeys } from "./branchesDashboard.keys";

export const useBranchesDashboard = (
  branchIds: number[],
  startDate: Date,
  endDate: Date,
) =>
  useQuery({
    queryKey: branchesDashboardKeys.summary(
      branchIds,
      toLocalDateString(startDate),
      toLocalDateString(endDate),
    ),
    queryFn: () => fetchBranchesDashboard(branchIds, startDate, endDate),
    enabled: branchIds.length > 0,
    staleTime: 1000 * 60,
  });
