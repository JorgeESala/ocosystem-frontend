import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getInboundBatches,
  getLatestInboundBatches,
  createInboundBatch,
  updateInboundBatch,
  deleteInboundBatch,
  getInboundBatchesByDateRange,
} from "./inboundBatches.api";
import { inboundBatchKeys } from "./inboundBatch.keys";
import type { UpdateInboundBatchPayload } from "../types";

export const useInboundBatches = () => {
  return useQuery({
    queryKey: inboundBatchKeys.list(),
    queryFn: getInboundBatches,
  });
};

export const useLatestInboundBatches = (limit = 15) => {
  return useQuery({
    queryKey: inboundBatchKeys.latest(limit),
    queryFn: () => getLatestInboundBatches(limit),
  });
};

export const useCreateInboundBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInboundBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.all,
      });
    },
  });
};

export const useInboundBatchesByDateRange = (
  startDate: Date | null,
  endDate: Date | null,
  enabled = true,
) => {
  const isReady = enabled && !!startDate && !!endDate;

  return useQuery({
    queryKey: inboundBatchKeys.range(startDate!, endDate!),
    queryFn: () => getInboundBatchesByDateRange(startDate!, endDate!),
    enabled: isReady,
  });
};

export const useUpdateInboundBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateInboundBatchPayload;
    }) => updateInboundBatch(id, payload),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.detail(id),
      });
    },
  });
};

export const useDeleteInboundBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInboundBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.all,
      });
    },
  });
};
