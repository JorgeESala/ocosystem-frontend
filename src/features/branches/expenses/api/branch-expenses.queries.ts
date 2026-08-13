import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BranchExpenseFilters, BranchExpenseRequestDTO } from "../types";
import { branchExpensesApi } from "./branch-expenses.api";
import { branchExpensesKeys } from "./branch-expenses.keys";

export const useLatestBranchExpenses = () =>
  useQuery({
    queryKey: branchExpensesKeys.latest(),
    queryFn: branchExpensesApi.getLatest,
  });

export const useBranchExpensesSearch = (filters: BranchExpenseFilters | null) =>
  useQuery({
    queryKey: filters
      ? branchExpensesKeys.search(
          filters.branchIds,
          filters.startDate.toISOString(),
          filters.endDate.toISOString(),
        )
      : ([...branchExpensesKeys.all, "search", "disabled"] as const),
    queryFn: () => branchExpensesApi.search(filters!),
    enabled: Boolean(filters),
  });

const upsertExpenseInCache = <T extends { id: number }>(
  current: T[] | undefined,
  next: T,
) => {
  if (!current) return current;

  return current.map((item) => (item.id === next.id ? next : item));
};

export const useCreateBranchExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BranchExpenseRequestDTO) =>
      branchExpensesApi.create(payload),
    onSuccess: (savedExpense) => {
      queryClient.setQueriesData(
        { queryKey: branchExpensesKeys.all },
        (current) =>
          upsertExpenseInCache(current as any[] | undefined, savedExpense),
      );
      queryClient.invalidateQueries({ queryKey: branchExpensesKeys.all });
    },
  });
};

export const useUpdateBranchExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: BranchExpenseRequestDTO;
    }) => branchExpensesApi.update(id, payload),
    onSuccess: (savedExpense) => {
      queryClient.setQueriesData(
        { queryKey: branchExpensesKeys.all },
        (current) =>
          upsertExpenseInCache(current as any[] | undefined, savedExpense),
      );
      queryClient.invalidateQueries({ queryKey: branchExpensesKeys.all });
    },
  });
};
