import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { scheduleTemplatesApi } from "./schedule-templates.api";
import { scheduleTemplatesKeys } from "./schedule-templates.keys";
import { expectedEventsKeys } from "./expected-events.keys";
import type { ScheduleTemplate } from "../types/schedule-template.types";

export const useScheduleTemplates = (branchId?: number) =>
  useQuery({
    queryKey: scheduleTemplatesKeys.list(branchId),
    queryFn: () => scheduleTemplatesApi.list({ branchId }),
    staleTime: 1000 * 60 * 5,
  });

export const useCreateScheduleTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      template: Omit<ScheduleTemplate, "id" | "branchName" | "createdBy">,
    ) => scheduleTemplatesApi.create(template),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleTemplatesKeys.all });
      qc.invalidateQueries({ queryKey: expectedEventsKeys.all });
    },
  });
};

export const useDeleteScheduleTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => scheduleTemplatesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: scheduleTemplatesKeys.all });
    },
  });
};
