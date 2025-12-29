import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  getLatestExpenses,
  createExpense,
  updateExpense,
} from "./expense.api";
import { expenseKeys } from "./expense.keys";
import type {
  ExpenseCreateRequestDTO,
  ExpenseUpdateRequestDTO,
} from "../types";

/* =======================
   Queries
======================= */

export const useExpenses = () => {
  return useQuery({
    queryKey: expenseKeys.list(),
    queryFn: getExpenses,
  });
};

export const useLatestExpenses = () => {
  return useQuery({
    queryKey: expenseKeys.latest(),
    queryFn: getLatestExpenses,
  });
};

/* =======================
   Mutations
======================= */

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: ExpenseCreateRequestDTO) => createExpense(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ExpenseUpdateRequestDTO }) =>
      updateExpense(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
};
