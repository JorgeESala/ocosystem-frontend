import type { BranchExpenseResponseDTO } from "../types";

export interface ExpenseSummaryItem {
  label: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface BranchExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  topBranch?: ExpenseSummaryItem;
  topBusinessUnit?: ExpenseSummaryItem;
  topExpenseCategory?: ExpenseSummaryItem;
  byBranch: ExpenseSummaryItem[];
  byBusinessUnit: ExpenseSummaryItem[];
  byExpenseCategory: ExpenseSummaryItem[];
}

const sumBy = (
  expenses: BranchExpenseResponseDTO[],
  getKey: (expense: BranchExpenseResponseDTO) => string,
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

export const buildBranchExpenseSummary = (
  expenses: BranchExpenseResponseDTO[],
): BranchExpenseSummary => {
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const expenseCount = expenses.length;
  const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;

  const byBranch = addPercentages(
    sumBy(expenses, (expense) => expense.branchName || "Sin sucursal"),
    totalAmount,
  );
  const byBusinessUnit = addPercentages(
    sumBy(
      expenses,
      (expense) =>
        expense.businessUnitCategoryName ??
        expense.businessUnitName ??
        "Sin unidad",
    ),
    totalAmount,
  );
  const byExpenseCategory = addPercentages(
    sumBy(expenses, (expense) => expense.expenseCategoryName || "Sin tipo"),
    totalAmount,
  );

  return {
    totalAmount,
    expenseCount,
    averageAmount,
    topBranch: byBranch[0],
    topBusinessUnit: byBusinessUnit[0],
    topExpenseCategory: byExpenseCategory[0],
    byBranch,
    byBusinessUnit,
    byExpenseCategory,
  };
};
