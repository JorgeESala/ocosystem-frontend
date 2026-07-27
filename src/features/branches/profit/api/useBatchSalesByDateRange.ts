import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { salesApi } from "@/features/batch/branch/api/sales.api";

export const useBatchSalesByDateRange = (
  branchIds: number[],
  startDate: Date | null,
  endDate: Date | null,
) => {
  const enabled =
    branchIds.length > 0 && startDate !== null && endDate !== null;

  const query = useQuery({
    queryKey: [
      "branch-profit",
      "batch-sales-daily",
      [...branchIds].sort((a, b) => a - b),
      startDate?.toISOString() ?? null,
      endDate?.toISOString() ?? null,
    ] as const,
    queryFn: () =>
      salesApi.searchByBranchAndDate(
        branchIds,
        startDate as Date,
        endDate as Date,
      ),
    enabled,
  });

  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    if (!query.data) return map;
    for (const sale of query.data) {
      const day = sale.date;
      map.set(day, (map.get(day) ?? 0) + sale.saleTotal);
    }
    return map;
  }, [query.data]);

  const dailyQuantityByDate = useMemo(() => {
    const map = new Map<string, number>();
    if (!query.data) return map;
    for (const sale of query.data) {
      const day = sale.date;
      map.set(day, (map.get(day) ?? 0) + sale.quantitySold);
    }
    return map;
  }, [query.data]);

  const dailyQuantityByBranch = useMemo(() => {
    const result = new Map<number, Map<string, number>>();
    if (!query.data) return result;
    for (const sale of query.data) {
      if (sale.branchId == null) continue;
      let dayMap = result.get(sale.branchId);
      if (!dayMap) {
        dayMap = new Map();
        result.set(sale.branchId, dayMap);
      }
      dayMap.set(sale.date, (dayMap.get(sale.date) ?? 0) + sale.quantitySold);
    }
    return result;
  }, [query.data]);

  return {
    dailyTotals,
    dailyQuantityByDate,
    dailyQuantityByBranch,
    isLoading: enabled && query.isLoading,
    isError: enabled && query.isError,
  };
};
