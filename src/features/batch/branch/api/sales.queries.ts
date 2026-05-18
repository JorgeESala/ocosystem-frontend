import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "./sales.api";
import { salesKeys } from "./sales.keys";
import type { BranchesBatchSale } from "@/services/api";

export const useSalesByBatch = (batchId: number) => {
  return useQuery({
    queryKey: salesKeys.list({ batchId }),
    queryFn: () => salesApi.getByBatchId(batchId),
    enabled: !!batchId,
  });
};

export const useUpdateSaleOfficeStatus = (batchId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      saleId,
      officeReceived,
    }: {
      saleId: number;
      officeReceived: boolean;
    }) => salesApi.updateOfficeStatus(saleId, officeReceived),

    onSuccess: (updatedSale) => {
      // 1. Apuntamos EXACTAMENTE a la misma queryKey que usa tu componente padre
      const targetQueryKey = ["batchSales", Number(batchId)];

      // 2. Aplicamos la actualización optimista/local para que pinte verde al instante
      queryClient.setQueryData<BranchesBatchSale[]>(
        targetQueryKey,
        (oldSales) => {
          if (!oldSales) return [];
          return oldSales.map((sale) =>
            sale.id === updatedSale.id
              ? { ...sale, officeReceived: updatedSale.officeReceived }
              : sale,
          );
        },
      );

      // 3. Invalidamos para asegurar consistencia con el servidor
      queryClient.invalidateQueries({ queryKey: targetQueryKey });
    },
    onError: (error) => {
      console.error("Error al actualizar el estado financiero:", error);
      alert("No se pudo actualizar el estado en el servidor.");
    },
  });
};
