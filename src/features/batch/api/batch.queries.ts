import axios from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import * as api from "./batch.api";
import { batchKeys } from "./batch.keys";
import { accountsPayableKeys } from "@/features/accounting/api/accounts-payable.keys";

// Hook para obtener remesas
export const useBatches = (
  unit: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: batchKeys.lists(unit, startDate, endDate),
    queryFn: () => api.getBatches(unit, startDate, endDate),
  });
};

export const useBatchById = (id: number | null) => {
  return useQuery({
    queryKey: batchKeys.details(id ?? 0),
    queryFn: () => api.getBatchById(id!),
    enabled: id != null && id > 0,
  });
};

// Hook para obtener ventas (AHORA CON OPTIONS)
export const useBatchSales = (
  batchId: number,
  options?: Partial<UseQueryOptions<any, Error>>,
) => {
  return useQuery({
    queryKey: batchKeys.sales(batchId),
    queryFn: () => api.getBatchSales(batchId),
    ...options, // Esparcimos las opciones (aquí entrará el enabled: isOpen)
    enabled:
      (options?.enabled !== undefined ? options.enabled : true) && !!batchId,
  });
};

// Hook para ajustes (AHORA CON OPTIONS)
export const useBatchAdjustments = (
  batchId: number,
  options?: Partial<UseQueryOptions<any, Error>>,
) => {
  return useQuery({
    queryKey: batchKeys.adjustments(batchId),
    queryFn: () => api.getBatchAdjustments(batchId),
    ...options,
    enabled:
      (options?.enabled !== undefined ? options.enabled : true) && !!batchId,
  });
};
export const useCreateBatchSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createBatchSale,
    onSuccess: (_, variables) => {
      const bId = Number(variables.batchId);

      queryClient.invalidateQueries({
        queryKey: batchKeys.fullDetail(bId),
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });

      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.all });
    },
  });
};
export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createBatch, // Asegúrate de que api.createBatch esté definido en batch.api.ts
    onSuccess: () => {
      // Refrescamos la lista de las remesas de todas las unidades de negocio
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.all });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.updateBatch(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: batchKeys.details(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.all });
    },
  });
};

export const useBatchFullDetail = (
  batchId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    // USAR LA KEY OFICIAL:
    queryKey: batchKeys.fullDetail(batchId),
    queryFn: () => api.getBatchFullDetail(batchId),
    ...options,
  });
};
export const useUpdateBatchSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.updateBatchSale(id, data),

    onSuccess: (_, variables) => {
      const bId = Number(variables.data.batchId);

      queryClient.invalidateQueries({
        queryKey: batchKeys.fullDetail(bId),
      });

      queryClient.invalidateQueries({
        queryKey: batchKeys.lists(),
      });

      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: accountsPayableKeys.all });
    },

    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as any)?.message ??
          error.response?.statusText ??
          error.message)
        : error instanceof Error
          ? error.message
          : "No se pudo guardar la venta";
      throw new Error(message);
    },
  });
};

export const useBulkUpdateBatchSaleRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      saleIds,
      routeId,
    }: {
      saleIds: number[];
      routeId: number;
    }) => api.bulkUpdateBatchSaleRoute(saleIds, routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
};

export const useWeeklySalesReport = (
  startDate: string | null,
  endDate: string | null,
) => {
  return useQuery({
    queryKey: batchKeys.weeklySales(
      startDate ?? undefined,
      endDate ?? undefined,
    ),
    queryFn: () => api.getWeeklySalesReport(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });
};

export const useSalesByClient = (
  startDate: string | null,
  endDate: string | null,
) => {
  return useQuery({
    queryKey: batchKeys.salesByClient(
      startDate ?? undefined,
      endDate ?? undefined,
    ),
    queryFn: () => api.getSalesByClient(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });
};
