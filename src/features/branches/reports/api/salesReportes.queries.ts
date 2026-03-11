import { useQuery } from "@tanstack/react-query";
import { fetchSalesReport } from "./salesReports.api";
import { salesReportKeys } from "./salesReports.keys";

export const useSalesReport = (
  branchId: number | "", // Permitimos que llegue el estado vacío
  startDate: Date,
  endDate: Date,
) => {
  return useQuery({
    queryKey: salesReportKeys.byFilters(branchId || 0, startDate, endDate),
    queryFn: () => fetchSalesReport(branchId as number, startDate, endDate),
    enabled:
      typeof branchId === "number" && branchId > 0 && !!startDate && !!endDate,
  });
};
