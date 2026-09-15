import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

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
  const { slug } = useParams<{ slug: string }>();

  return useQuery<InboundBatchSale[]>({
    queryKey: inboundBatchSalesKeys.list(slug, batchId),
    queryFn: () => getInboundBatchSales(batchId),
    enabled: !!slug && !!batchId,
  });
};

/* =========================
   MUTATIONS
   ========================= */

export const useCreateInboundBatchSale = (batchId: number) => {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();

  return useMutation({
    mutationFn: ({ payload }: { payload: CreateInboundBatchSalePayload }) =>
      createInboundBatchSale(batchId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchSalesKeys.list(slug, batchId),
      });

      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.detail(slug, batchId),
      });
    },
  });
};
export const useUpdateInboundBatchSale = (batchId: number, saleId: number) => {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();

  return useMutation({
    mutationFn: (payload: UpdateInboundBatchSalePayload) =>
      updateInboundBatchSale(batchId, saleId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inboundBatchSalesKeys.list(slug, batchId),
      });

      queryClient.invalidateQueries({
        queryKey: inboundBatchKeys.detail(slug, batchId),
      });
    },
  });
};
