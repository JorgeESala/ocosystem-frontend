import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "./sales.api";
import type { BranchesBatchSale } from "@/services/api";

export const useSalesByBatch = (batchId: number, enabled = true) => {
  return useQuery({
    queryKey: ["batchSales", batchId],
    queryFn: () => salesApi.getByBatchId(batchId),
    enabled: !!batchId && enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesByBatches = (batchIds: number[]) => {
  const queryClient = useQueryClient();
  const sortedIds = useMemo(
    () => [...new Set(batchIds)].sort((a, b) => a - b),
    [batchIds],
  );

  return useQuery({
    queryKey: ["batchSales", "by-batches", sortedIds],
    queryFn: async () => {
      const sales = await salesApi.searchByBatchIds(batchIds);
      const byBatch = new Map<number, BranchesBatchSale[]>();
      for (const sale of sales) {
        if (sale.batchId == null) continue;
        const list = byBatch.get(sale.batchId) ?? [];
        list.push(sale);
        byBatch.set(sale.batchId, list);
      }
      for (const [id, list] of byBatch) {
        queryClient.setQueryData(["batchSales", id], list);
      }
      return sales;
    },
    enabled: sortedIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMarkCuentasReceived = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: Array<{ saleId: number; batchId: number }>) => {
      await Promise.all(
        entries.map(({ saleId }) => salesApi.updateOfficeStatus(saleId, true)),
      );
    },
    onSuccess: (_, entries) => {
      const batchIds = new Set(entries.map((e) => e.batchId));
      for (const batchId of batchIds) {
        queryClient.invalidateQueries({ queryKey: ["batchSales", batchId] });
      }
      queryClient.invalidateQueries({ queryKey: ["batchSales", "by-batches"] });
    },
    onError: (error) => {
      console.error("Error al marcar la cuenta como recibida:", error);
      alert("No se pudieron marcar todas las ventas como recibidas.");
    },
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
      const targetQueryKey = ["batchSales", Number(batchId)];

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

      queryClient.invalidateQueries({ queryKey: targetQueryKey });
      queryClient.invalidateQueries({ queryKey: ["batchSales", "by-batches"] });
    },
    onError: (error) => {
      console.error("Error al actualizar el estado financiero:", error);
      alert("No se pudo actualizar el estado en el servidor.");
    },
  });
};
