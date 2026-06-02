import type { ExpenseResponseDTO } from "../types/expense.types";
import { ExpenseTypeLabels } from "@/core/api/types";

export interface ExpenseSummaryItem {
  label: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  topCategory?: ExpenseSummaryItem;
  byCategory: ExpenseSummaryItem[];
  byExpenseType: ExpenseSummaryItem[];
}

const sumBy = (
  expenses: ExpenseResponseDTO[],
  getKey: (expense: ExpenseResponseDTO) => string,
) => {
  const map = new Map<
    string,
    { label: string; totalAmount: number; expenseCount: number }
  >();

  for (const expense of expenses) {
    const key = getKey(expense);
    const current = map.get(key);
    if (!current) {
      map.set(key, {
        label: key,
        totalAmount: Number(expense.amount || 0),
        expenseCount: 1,
      });
      continue;
    }

    current.totalAmount += Number(expense.amount || 0);
    current.expenseCount += 1;
  }

  return [...map.values()];
};

const addPercentages = (
  items: Array<{ label: string; totalAmount: number; expenseCount: number }>,
  totalAmount: number,
) =>
  items
    .map((item) => ({
      ...item,
      percentage: totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

export const buildExpenseSummary = (
  expenses: ExpenseResponseDTO[],
): ExpenseSummary => {
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const expenseCount = expenses.length;
  const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;

  const byCategory = addPercentages(
    sumBy(expenses, (e) => e.categoryName || "Sin tipo"),
    totalAmount,
  );
  const byExpenseType = addPercentages(
    sumBy(
      expenses,
      (e) => ExpenseTypeLabels[e.expenseType] ?? e.expenseType ?? "Sin tipo",
    ),
    totalAmount,
  );

  return {
    totalAmount,
    expenseCount,
    averageAmount,
    topCategory: byCategory[0],
    byCategory,
    byExpenseType,
  };
};