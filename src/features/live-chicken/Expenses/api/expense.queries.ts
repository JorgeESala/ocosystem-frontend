// expense.queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "./expense.api";
import { expenseKeys } from "./expense.keys";
import {
  ExpenseCreateRequestDTO,
  type ExpenseUpdateRequestDTO,
} from "../types/expense.types";

/* ---------- Queries ---------- */

export const useLatestExpenses = () =>
  useQuery({
    queryKey: expenseKeys.latest(),
    queryFn: expenseApi.getLatest,
  });

export const useExpensesBetween = (start: string, end: string) =>
  useQuery({
    queryKey: expenseKeys.between(start, end),
    queryFn: () => expenseApi.getBetween(start, end),
    enabled: Boolean(start && end),
  });
export const useExpenseById = (id: number | null) =>
  useQuery({
    queryKey: id ? expenseKeys.detail(id) : [],
    queryFn: () => expenseApi.getById(id!),
    enabled: Boolean(id),
  });

/* ---------- Mutations ---------- */

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseCreateRequestDTO) =>
      expenseApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.all,
      });
    },
  });
};
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ExpenseUpdateRequestDTO;
    }) => expenseApi.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: expenseKeys.all,
      });
    },
  });
};
