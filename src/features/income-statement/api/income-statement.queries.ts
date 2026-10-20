import { useQuery } from "@tanstack/react-query";
import * as api from "./income-statement.api";
import { incomeStatementKeys } from "./income-statement.keys";

export const useIncomeStatement = (
  unitType: string,
  startDate: string | null,
  endDate: string | null,
) => {
  return useQuery({
    queryKey: incomeStatementKeys.report(
      unitType,
      startDate ?? undefined,
      endDate ?? undefined,
    ),
    queryFn: () => api.getIncomeStatement(startDate!, endDate!),
    enabled: !!startDate && !!endDate,
  });
};
