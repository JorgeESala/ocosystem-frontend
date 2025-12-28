import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getInboundBatchSales,
  createInboundBatchSale,
  updateInboundBatchSale,
} from "./inboundBatchSales.api";

import { inboundBatchSalesKeys } from "./inboundBatchSales.keys";
import { inboundBatchKeys } from "../api/inboundBatch.keys";

import type {
  InboundBatchSale,
  CreateInboundBatchSalePayload,
  UpdateInboundBatchSalePayload,
} from "../types";

/* =========================
   QUERIES
   ========================= */

export const useInboundBatchSales = (batchId: number) => {
  return useQuery<InboundBatchSale[]>({
    queryKey: inboundBatchSalesKeys.list(batchId),
    queryFn: () => getInboundBatchSales(batchId),
    enabled: !!batchId,
  });
};

/* =========================
   MUTATIONS
   ========================= */

export const useCreateInboundBatchSale = (batchId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload }: { payload: CreateInboundBatchSalePayload }) =>
      createInboundBatchSale(batchId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchSalesKeys.list(batchId),
      });

      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.detail(batchId),
      });
    },
  });
};
export const useUpdateInboundBatchSale = (batchId: number, saleId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateInboundBatchSalePayload) =>
      updateInboundBatchSale(batchId, saleId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchSalesKeys.list(batchId),
      });

      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.detail(batchId),
      });
    },
  });
};
