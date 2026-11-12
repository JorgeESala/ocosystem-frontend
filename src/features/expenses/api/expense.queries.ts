import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "./expense.api";
import { expenseKeys } from "./expense.keys";
import type {
  ExpenseComparisonFilters,
  ExpenseComparisonRange,
  ExpenseCreateRequestDTO,
  ExpenseUpdateRequestDTO,
  ExpensesUnitType,
} from "../types/expense.types";

export const useFilterExpenses = (
  unitType: ExpensesUnitType,
  filters: { start: Date; end: Date } | null,
) =>
  useQuery({
    queryKey: filters
      ? expenseKeys(unitType).between(
          filters.start.toISOString(),
          filters.end.toISOString(),
        )
      : [...expenseKeys(unitType).all, "filter", "disabled"],
    queryFn: () =>
      expenseApi.filter(
        filters!.start.toISOString().split("T")[0],
        filters!.end.toISOString().split("T")[0],
      ),
    enabled: Boolean(filters),
  });

export const useExpenseComparison = (
  unitType: ExpensesUnitType,
  range: ExpenseComparisonRange | null,
  filters: ExpenseComparisonFilters,
) =>
  useQuery({
    queryKey: range
      ? expenseKeys(unitType).comparison(
          range.start.toISOString(),
          range.end.toISOString(),
          range.previousStart.toISOString(),
          range.previousEnd.toISOString(),
          filters.categories.join(","),
          filters.expenseTypes.join(","),
        )
      : [...expenseKeys(unitType).all, "comparison", "disabled"],
    queryFn: () =>
      expenseApi.compare(
        range!.start,
        range!.end,
        range!.previousStart,
        range!.previousEnd,
        filters.categories,
        filters.expenseTypes,
      ),
    enabled: Boolean(range),
  });

export const useExpenseById = (unitType: ExpensesUnitType, id: number | null) =>
  useQuery({
    queryKey: id ? expenseKeys(unitType).detail(id) : [],
    queryFn: () => expenseApi.getById(id!),
    enabled: Boolean(id),
  });

export const useCreateExpense = (unitType: ExpensesUnitType) => {
  const queryClient = useQueryClient();
  const keys = expenseKeys(unitType);

  return useMutation({
    mutationFn: (payload: ExpenseCreateRequestDTO) =>
      expenseApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
};

export const useUpdateExpense = (unitType: ExpensesUnitType) => {
  const queryClient = useQueryClient();
  const keys = expenseKeys(unitType);

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExpenseUpdateRequestDTO;
    }) => expenseApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
};
