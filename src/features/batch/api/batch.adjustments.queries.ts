import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./batch.adjustments.api";
import { batchKeys } from "./batch.keys";
export const useCreateAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createAdjustment,
    onSuccess: (_, variables) => {
      const batchId = variables.batchId;

      queryClient.invalidateQueries({
        queryKey: batchKeys.fullDetail(batchId),
      });
      queryClient.invalidateQueries({ queryKey: batchKeys.sales(batchId) });
      queryClient.invalidateQueries({
        queryKey: batchKeys.adjustments(batchId),
      });
    },
  });
};

export const useUpdateBatchAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Desestructuramos el objeto que recibe la mutación
    mutationFn: ({
      batchId,
      id,
      data,
    }: {
      batchId: number;
      id: number;
      data: any;
    }) => api.updateBatchAdjustment(batchId, id, data),

    onSuccess: (_, variables) => {
      const { batchId } = variables;
      queryClient.invalidateQueries({
        queryKey: batchKeys.details(batchId),
      });
      queryClient.invalidateQueries({
        queryKey: batchKeys.lists(),
      });
    },

    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? ((error.response?.data as any)?.message ??
          error.response?.statusText ??
          error.message)
        : error instanceof Error
          ? error.message
          : "No se pudo guardar la baja";
      throw new Error(message);
    },
  });
};
