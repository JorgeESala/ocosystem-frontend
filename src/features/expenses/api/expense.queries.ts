import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "./expense.api";
import { expenseKeys } from "./expense.keys";
import type {
  ExpenseCreateRequestDTO,
  ExpenseFilters,
  ExpenseUpdateRequestDTO,
  ExpensesUnitType,
} from "../types/expense.types";

export const useLatestExpenses = (unitType: ExpensesUnitType) =>
  useQuery({
    queryKey: expenseKeys(unitType).latest(),
    queryFn: expenseApi.getLatest,
  });

export const useExpensesBetween = (
  unitType: ExpensesUnitType,
  start: string,
  end: string,
) =>
  useQuery({
    queryKey: expenseKeys(unitType).between(start, end),
    queryFn: () => expenseApi.getBetween(start, end),
    enabled: Boolean(start && end),
  });

export const useSearchExpenses = (
  unitType: ExpensesUnitType,
  filters: ExpenseFilters | null,
) =>
  useQuery({
    queryKey: filters
      ? expenseKeys(unitType).between(
          filters.startDate.toISOString(),
          filters.endDate.toISOString(),
        )
      : [...expenseKeys(unitType).all, "search", "disabled"],
    queryFn: () =>
      expenseApi.getBetween(
        filters!.startDate.toISOString(),
        filters!.endDate.toISOString(),
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