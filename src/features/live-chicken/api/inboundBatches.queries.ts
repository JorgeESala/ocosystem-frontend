import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
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
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: inboundBatchKeys.list(slug),
    queryFn: getInboundBatches,
    enabled: !!slug,
  });
};

export const useLatestInboundBatches = (limit = 15) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: inboundBatchKeys.latest(slug, limit),
    queryFn: () => getLatestInboundBatches(limit),
    enabled: !!slug,
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
  const { slug } = useParams<{ slug: string }>();
  const isReady = !!slug && enabled && !!startDate && !!endDate;

  return useQuery({
    queryKey: inboundBatchKeys.range(slug, startDate!, endDate!),
    queryFn: () => getInboundBatchesByDateRange(startDate!, endDate!),
    enabled: isReady,
  });
};

export const useUpdateInboundBatch = () => {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();

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
        queryKey: inboundBatchKeys.lists(slug),
      });

      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.detail(slug, id),
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
