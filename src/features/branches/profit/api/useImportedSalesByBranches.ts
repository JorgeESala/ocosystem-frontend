import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchSalesReport } from "@/features/branches/reports/api/salesReports.api";
import type { Branch } from "@/features/branches/branch/types";

const normalizeCategory = (name: string) => name.trim().toLowerCase();

const buildByCategory = (
  products: { categoryName: string; totalSales: number }[] | undefined,
) => {
  const map: Record<string, number> = {};
  if (!products) return map;
  for (const product of products) {
    const key = normalizeCategory(product.categoryName);
    map[key] = (map[key] ?? 0) + (Number(product.totalSales) || 0);
  }
  return map;
};

export interface ImportedByBranch {
  branchId: number;
  branchName: string;
  byCategory: Record<string, number>;
  total: number;
}

export interface UseImportedSalesByBranchesResult {
  totalImported: number;
  byBranch: ImportedByBranch[];
  dailyTotalsByBranch: Map<number, Map<string, number>>;
  dailyMatadosByBranch: Map<number, Map<string, number>>;
  isLoading: boolean;
  isError: boolean;
}

interface UseImportedSalesByBranchesArgs {
  branchIds: number[];
  startDate: Date | null;
  endDate: Date | null;
  branches: Branch[];
}

export const useImportedSalesByBranches = ({
  branchIds,
  startDate,
  endDate,
  branches,
}: UseImportedSalesByBranchesArgs): UseImportedSalesByBranchesResult => {
  const branchNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const branch of branches) {
      map.set(branch.id, branch.name);
    }
    return map;
  }, [branches]);

  const enabled =
    branchIds.length > 0 && startDate !== null && endDate !== null;

  const queries = useQueries({
    queries: branchIds.map((branchId) => ({
      queryKey: [
        "branch-profit",
        "imported-sales",
        branchId,
        startDate?.toISOString() ?? null,
        endDate?.toISOString() ?? null,
      ] as const,
      queryFn: () =>
        fetchSalesReport(branchId, startDate as Date, endDate as Date),
      enabled,
    })),
  });

  const byBranch: ImportedByBranch[] = useMemo(() => {
    return queries.map((q, index) => {
      const branchId = branchIds[index];
      const byCategory = buildByCategory(q.data?.products);
      const total = Object.values(byCategory).reduce(
        (sum, value) => sum + value,
        0,
      );
      return {
        branchId,
        branchName: branchNameById.get(branchId) ?? `Sucursal ${branchId}`,
        byCategory,
        total,
      };
    });
  }, [queries, branchIds, branchNameById]);

  const totalImported = useMemo(
    () => byBranch.reduce((sum, item) => sum + item.total, 0),
    [byBranch],
  );

  const dailyTotalsByBranch = useMemo(() => {
    const result = new Map<number, Map<string, number>>();
    queries.forEach((q, index) => {
      const branchId = branchIds[index];
      const dayMap = new Map<string, number>();
      if (q.data?.dailyCategorySales) {
        for (const d of q.data.dailyCategorySales) {
          if (normalizeCategory(d.categoryName) === "pollo") {
            dayMap.set(
              d.day,
              (dayMap.get(d.day) ?? 0) + (Number(d.totalSales) || 0),
            );
          }
        }
      }
      result.set(branchId, dayMap);
    });
    return result;
  }, [queries, branchIds]);

  const dailyMatadosByBranch = useMemo(() => {
    const result = new Map<number, Map<string, number>>();
    queries.forEach((q, index) => {
      const branchId = branchIds[index];
      const dayMap = new Map<string, number>();
      if (q.data?.dailyCategorySales) {
        for (const d of q.data.dailyCategorySales) {
          if (normalizeCategory(d.categoryName) === "matados") {
            dayMap.set(
              d.day,
              (dayMap.get(d.day) ?? 0) + (Number(d.quantitySold) || 0),
            );
          }
        }
      }
      result.set(branchId, dayMap);
    });
    return result;
  }, [queries, branchIds]);

  const isLoading = enabled && queries.some((q) => q.isLoading);
  const isError = enabled && queries.some((q) => q.isError);

  return {
    totalImported,
    byBranch,
    dailyTotalsByBranch,
    dailyMatadosByBranch,
    isLoading: isLoading && !queries.some((q) => q.data),
    isError,
  };
};
