import { useQuery } from "@tanstack/react-query";
import { fetchConsolidatedSalesReport } from "./consolidatedSales.api";
import { salesReportKeys } from "./salesReports.keys";

export const useConsolidatedSalesReport = (
  branchIds: number[],
  startDate: Date,
  endDate: Date,
) => {
  return useQuery({
    queryKey: salesReportKeys.consolidated(branchIds, startDate, endDate),
    queryFn: () => fetchConsolidatedSalesReport(branchIds, startDate, endDate),
    enabled: branchIds.length > 0 && !!startDate && !!endDate,
  });
};
