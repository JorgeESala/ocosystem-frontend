import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "./batch.adjustments.api";
import { batchKeys } from "./batch.keys";
export const useCreateAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createAdjustment,
    onSuccess: (_, variables) => {
      const batchId = variables.batchId;

      // 1. Invalidar el detalle unificado (Para que la tabla y badges se actualicen)
      queryClient.invalidateQueries({
        queryKey: batchKeys.fullDetail(batchId),
      });

      // 2. Invalidar la lista general (Para que el stock en la lista principal cambie)
      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });

      // 3. Opcional: Si aún usas los endpoints viejos en algún lado
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
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.updateBatchAdjustment(id, data),
    onSuccess: (_, variables) => {
      const bId = Number(variables.data.batchId);

      queryClient.invalidateQueries({
        queryKey: batchKeys.fullDetail(bId),
      });

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },
  });
};
