import { useQuery } from "@tanstack/react-query";
import { checklistApi } from "./checklist.api";
import { checklistKeys } from "./checklist.keys";
import type {
  ChecklistResponse,
  PerformanceQueryParams,
} from "../types/checklist.types";

interface UseDailyChecklistParams {
  date: string;
  branchIds?: number[];
  enabled?: boolean;
}

export const useDailyChecklist = ({
  date,
  branchIds,
  enabled = true,
}: UseDailyChecklistParams) =>
  useQuery({
    queryKey: checklistKeys.daily(date, branchIds ?? []),
    queryFn: () => checklistApi.getDaily({ date, branchIds }),
    enabled,
    staleTime: 1000 * 60,
  });

interface UseBranchPerformanceParams {
  from: string;
  to: string;
  branchIds?: number[];
  includeDays?: boolean;
  enabled?: boolean;
}

export const useBranchPerformance = ({
  from,
  to,
  branchIds,
  includeDays = false,
  enabled = true,
}: UseBranchPerformanceParams) =>
  useQuery({
    queryKey: checklistKeys.performance(from, to, branchIds ?? [], includeDays),
    queryFn: () => {
      const params: PerformanceQueryParams = {
        from,
        to,
        branchIds,
        includeDays,
      };
      return checklistApi.getPerformance(params);
    },
    enabled,
    staleTime: 1000 * 60,
  });

export const useCurrentWeekPerformance = (branchIds?: number[]) =>
  useQuery<ChecklistResponse>({
    queryKey: checklistKeys.currentWeek(branchIds ?? []),
    queryFn: () => checklistApi.getCurrentWeekPerformance(branchIds),
    staleTime: 1000 * 60,
  });
