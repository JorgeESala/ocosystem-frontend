import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expectedEventsApi } from "./expected-events.api";
import { expectedEventsKeys } from "./expected-events.keys";
import type {
  ExpectedEvent,
  ExpectedEventBulkRequest,
} from "../types/expected-event.types";

interface UseExpectedEventsParams {
  branchId?: number;
  from?: string;
  to?: string;
  enabled?: boolean;
}

export const useExpectedEvents = ({
  branchId,
  from,
  to,
  enabled = true,
}: UseExpectedEventsParams) =>
  useQuery({
    queryKey: expectedEventsKeys.list(branchId, from, to),
    queryFn: () => expectedEventsApi.list({ branchId, from, to }),
    enabled,
    staleTime: 1000 * 60 * 5,
  });

export const useCreateExpectedEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      event: Omit<ExpectedEvent, "id" | "branchName" | "createdBy">,
    ) => expectedEventsApi.create(event),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expectedEventsKeys.all });
      qc.invalidateQueries({ queryKey: ["branch-checklist"] });
    },
  });
};

export const useCreateExpectedEventsBulk = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (request: ExpectedEventBulkRequest) =>
      expectedEventsApi.createBulk(request),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expectedEventsKeys.all });
      qc.invalidateQueries({ queryKey: ["branch-checklist"] });
    },
  });
};

export const useDeleteExpectedEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => expectedEventsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expectedEventsKeys.all });
      qc.invalidateQueries({ queryKey: ["branch-checklist"] });
    },
  });
};
