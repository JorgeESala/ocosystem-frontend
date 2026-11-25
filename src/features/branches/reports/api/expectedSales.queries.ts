import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteReferenceProduct,
  fetchExpectedSalesReport,
  fetchReferenceProducts,
  updateReferenceProduct,
} from "./expectedSales.api";
import { salesReportKeys } from "./salesReports.keys";

export const useExpectedSalesReport = (
  branchIds: number[],
  startDate: Date,
  endDate: Date,
) =>
  useQuery({
    queryKey: salesReportKeys.expected(branchIds, startDate, endDate),
    queryFn: () => fetchExpectedSalesReport(branchIds, startDate, endDate),
    enabled: branchIds.length > 0 && !!startDate && !!endDate,
  });

export const useReferenceProducts = (asOf: string) =>
  useQuery({
    queryKey: salesReportKeys.referenceProducts(asOf),
    queryFn: () => fetchReferenceProducts(asOf),
    enabled: asOf.length > 0,
  });

export const useUpdateReferenceProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      productBarcode,
    }: {
      branchId: number;
      productBarcode: string;
    }) => updateReferenceProduct(branchId, productBarcode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesReportKeys.all });
    },
  });
};

export const useDeleteReferenceProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: number) => deleteReferenceProduct(branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesReportKeys.all });
    },
  });
};
