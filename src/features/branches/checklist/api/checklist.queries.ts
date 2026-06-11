import { useQuery } from "@tanstack/react-query";
import { checklistApi } from "./checklist.api";
import { checklistKeys } from "./checklist.keys";

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
