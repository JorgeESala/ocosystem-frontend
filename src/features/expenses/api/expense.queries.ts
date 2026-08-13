import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "./expense.api";
import { expenseKeys } from "./expense.keys";
import type {
  ExpenseCreateRequestDTO,
  ExpenseUpdateRequestDTO,
  ExpensesUnitType,
} from "../types/expense.types";

export const useLatestExpenses = (unitType: ExpensesUnitType) =>
  useQuery({
    queryKey: expenseKeys(unitType).latest(),
    queryFn: expenseApi.getLatest,
  });

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
