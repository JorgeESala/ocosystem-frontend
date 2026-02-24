import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmSalesImport, uploadSalesReports } from "./report.api";
import type { ConfirmSalesImportRequestDTO } from "../types";

export const useUploadSalesReports = () => {
  return useMutation({
    mutationFn: ({ branchId, files }: { branchId: number; files: File[] }) =>
      uploadSalesReports(branchId, files),
  });
};

export const useConfirmSalesImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmSalesImportRequestDTO) =>
      confirmSalesImport(payload),

    onSuccess: () => {
      // 🔥 Opcional pero recomendado
      // invalidar datos que dependan de ventas
      queryClient.invalidateQueries({
        queryKey: ["tickets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });

      queryClient.invalidateQueries({
        queryKey: ["profit"],
      });
    },
  });
};
