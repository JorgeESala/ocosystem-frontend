import { useQuery } from "@tanstack/react-query";
import {
  getWeeklyWeightDiff,
  getWeeklyWeightDiffBatches,
} from "./weight-diff.api";
import type {
  WeeklyWeightDiffBatchRow,
  WeeklyWeightDiffRow,
} from "./types";

export const weightDiffKeys = {
  all: ["live-chicken", "weight-diff"] as const,
  list: (startDate: string, endDate: string) =>
    [...weightDiffKeys.all, "list", startDate, endDate] as const,
  batches: (weekStart: string, supplierId: number | null) =>
    [
      ...weightDiffKeys.all,
      "batches",
      weekStart,
      supplierId ?? "ALL",
    ] as const,
};

export const useWeeklyWeightDiff = (startDate: string, endDate: string) =>
  useQuery<WeeklyWeightDiffRow[]>({
    queryKey: weightDiffKeys.list(startDate, endDate),
    queryFn: () => getWeeklyWeightDiff(startDate, endDate),
  });

export const useWeeklyWeightDiffBatches = (
  weekStart: string | null,
  supplierId: number | null,
  enabled: boolean,
) =>
  useQuery<WeeklyWeightDiffBatchRow[]>({
    queryKey: weightDiffKeys.batches(weekStart ?? "", supplierId),
    queryFn: () => {
      if (!weekStart) return Promise.resolve([]);
      return getWeeklyWeightDiffBatches(weekStart, supplierId);
    },
    enabled: enabled && !!weekStart,
  });
