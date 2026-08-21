import { useQuery } from "@tanstack/react-query";
import * as api from "./profit.api";
import { profitKeys } from "./profit.keys";

export const useProfitReport = (
  unitType: string,
  startDate: string | null,
  endDate: string | null,
) => {
  return useQuery({
    queryKey: profitKeys.report(
      unitType,
      startDate ?? undefined,
      endDate ?? undefined,
    ),
    queryFn: () => api.getProfitReport(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });
};
