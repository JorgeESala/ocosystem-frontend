import { useQuery } from "@tanstack/react-query";
import { fetchExpectedSalesReport } from "./expectedSales.api";
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
