import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ReceiptFilters,
  RecordCostPayload,
  ResolveLinePayload,
  ResolveWithProductPayload,
} from "../types";
import { productReceiptsApi } from "./product-receipts.api";
import { productReceiptsKeys } from "./product-receipts.keys";

export const useProductReceipts = (filters: ReceiptFilters | null) =>
  useQuery({
    queryKey: filters
      ? productReceiptsKeys.list(filters)
      : ([...productReceiptsKeys.all, "list", "disabled"] as const),
    queryFn: () => productReceiptsApi.list(filters!),
    enabled: Boolean(filters),
  });

export const useReceiptDetail = (id: number | null) =>
  useQuery({
    queryKey: id !== null ? productReceiptsKeys.detail(id) : ([...productReceiptsKeys.all, "detail", "disabled"] as const),
    queryFn: () => productReceiptsApi.detail(id!),
    enabled: id !== null,
  });

export const useRecordCost = (receiptId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, payload }: { lineId: number; payload: RecordCostPayload }) =>
      productReceiptsApi.recordCost(lineId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productReceiptsKeys.detail(receiptId) });
      queryClient.invalidateQueries({ queryKey: productReceiptsKeys.all });
    },
  });
};

export const useResolveLine = (receiptId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lineId, payload }: { lineId: number; payload: ResolveLinePayload }) =>
      productReceiptsApi.resolveLine(lineId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productReceiptsKeys.detail(receiptId) });
      queryClient.invalidateQueries({ queryKey: productReceiptsKeys.all });
    },
  });
};

export const useResolveWithProduct = (receiptId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lineId,
      payload,
    }: {
      lineId: number;
      payload: ResolveWithProductPayload;
    }) => productReceiptsApi.resolveWithProduct(lineId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productReceiptsKeys.detail(receiptId) });
      queryClient.invalidateQueries({ queryKey: productReceiptsKeys.all });
    },
  });
};

export const useCatalogProducts = () =>
  useQuery({
    queryKey: [...productReceiptsKeys.all, "catalog"] as const,
    queryFn: productReceiptsApi.catalogProducts,
  });
