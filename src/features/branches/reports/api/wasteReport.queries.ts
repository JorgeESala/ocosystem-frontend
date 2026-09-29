import { useQuery } from "@tanstack/react-query";
import { fetchWasteReport } from "./wasteReport.api";
import { wasteReportKeys } from "./wasteReport.keys";

export const useWasteReport = (
  enabled: boolean,
  branchIds: number[],
  startDate: Date,
  endDate: Date,
) => {
  return useQuery({
    queryKey: wasteReportKeys.report(branchIds, startDate, endDate),
    queryFn: () => fetchWasteReport(branchIds, startDate, endDate),
    enabled: enabled && branchIds.length > 0 && !!startDate && !!endDate,
  });
};
