import { useQuery } from "@tanstack/react-query";
import { salesAnalyticsApi } from "./salesAnalytics.api";

export const salesAnalyticsKeys = {
  all: ["sales-analytics"] as const,
  data: (branchIds: number[], start: string, end: string) =>
    [...salesAnalyticsKeys.all, "data", { branchIds, start, end }] as const,
};

export const useSalesAnalytics = (
  branchIds: number[],
  start: Date | null,
  end: Date | null,
) =>
  useQuery({
    queryKey:
      branchIds.length > 0 && start && end
        ? salesAnalyticsKeys.data(
            branchIds.sort((a, b) => a - b),
            start.toISOString(),
            end.toISOString(),
          )
        : [...salesAnalyticsKeys.all, "disabled"],
    queryFn: () => salesAnalyticsApi.getAnalytics(branchIds, start!, end!),
    enabled: branchIds.length > 0 && start !== null && end !== null,
  });
