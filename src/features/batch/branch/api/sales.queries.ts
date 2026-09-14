import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { salesApi } from "./sales.api";
import { salesKeys } from "./sales.keys";
import type { BranchesBatchSale } from "@/services/api";

export const useSalesByBatch = (batchId: number, enabled = true) => {
  const { slug } = useParams<{ slug: string }>();

  return useQuery({
    queryKey: salesKeys.list(slug, batchId),
    queryFn: () => salesApi.getByBatchId(batchId),
    enabled: !!slug && !!batchId && enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSalesByBatches = (batchIds: number[]) => {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();
  const sortedIds = useMemo(
    () => [...new Set(batchIds)].sort((a, b) => a - b),
    [batchIds],
  );

  return useQuery({
    queryKey: salesKeys.byBatches(slug, sortedIds),
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
        queryClient.setQueryData(salesKeys.list(slug, id), list);
      }
      return sales;
    },
    enabled: !!slug && sortedIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMarkCuentasReceived = () => {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();

  return useMutation({
    mutationFn: async (entries: Array<{ saleId: number; batchId: number }>) => {
      await Promise.all(
        entries.map(({ saleId }) => salesApi.updateOfficeStatus(saleId, true)),
      );
    },
    onSuccess: (_, entries) => {
      const batchIds = new Set(entries.map((e) => e.batchId));
      for (const batchId of batchIds) {
        queryClient.invalidateQueries({
          queryKey: salesKeys.list(slug, batchId),
        });
      }
      queryClient.invalidateQueries({ queryKey: salesKeys.lists(slug) });
    },
    onError: (error) => {
      console.error("Error al marcar la cuenta como recibida:", error);
      alert("No se pudieron marcar todas las ventas como recibidas.");
    },
  });
};

export const useUpdateSaleOfficeStatus = (batchId: number) => {
  const queryClient = useQueryClient();
  const { slug } = useParams<{ slug: string }>();

  return useMutation({
    mutationFn: ({
      saleId,
      officeReceived,
    }: {
      saleId: number;
      officeReceived: boolean;
    }) => salesApi.updateOfficeStatus(saleId, officeReceived),

    onSuccess: (updatedSale) => {
      const targetQueryKey = salesKeys.list(slug, Number(batchId));

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
      queryClient.invalidateQueries({ queryKey: salesKeys.lists(slug) });
    },
    onError: (error) => {
      console.error("Error al actualizar el estado financiero:", error);
      alert("No se pudo actualizar el estado en el servidor.");
    },
  });
};
