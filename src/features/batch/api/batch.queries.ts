import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import * as api from "./batch.api";
import { batchKeys } from "./batch.keys";

// Hook para obtener remesas
export const useBatches = (unit: string) => {
  return useQuery({
    queryKey: batchKeys.lists(unit),
    queryFn: () => api.getBatches(unit),
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
      // Forzamos que sea número para que coincida con la key
      const bId = Number(variables.batchId);

      // Invalidamos el "fullDetail" de forma exacta
      queryClient.invalidateQueries({
        queryKey: batchKeys.fullDetail(bId),
        exact: true,
      });

      // Invalidamos TODA la rama de batches para asegurar que la lista principal se refresque
      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },
  });
};
export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createBatch, // Asegúrate de que api.createBatch esté definido en batch.api.ts
    onSuccess: () => {
      // Refrescamos la lista de lotes de todas las unidades de negocio
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() });
      // Opcional: podrías invalidar solo la unidad actual si la tienes a mano
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
        queryKey: batchKeys.lists(), // Más específico que .all
      });
    },
  });
};
