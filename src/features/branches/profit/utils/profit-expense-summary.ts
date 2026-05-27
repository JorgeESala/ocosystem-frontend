import type { BranchExpenseResponseDTO } from "@/features/branches/expenses/types";

export interface ProfitExpenseSummaryItem {
  label: string;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface BranchProfitExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageAmount: number;
  expenseToSalesRatio: number;
  topCategory?: ProfitExpenseSummaryItem;
  topBranch?: ProfitExpenseSummaryItem;
  topBusinessUnit?: ProfitExpenseSummaryItem;
  byCategory: ProfitExpenseSummaryItem[];
  byBranch: ProfitExpenseSummaryItem[];
  byBusinessUnit: ProfitExpenseSummaryItem[];
}

const getExpenseLabel = (expense: BranchExpenseResponseDTO) =>
  expense.businessUnitCategoryName ??
  expense.businessUnitName ??
  "Sin unidad";

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

export const buildBranchProfitExpenseSummary = (
  expenses: BranchExpenseResponseDTO[],
  totalSales: number,
): BranchProfitExpenseSummary => {
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0,
  );
  const expenseCount = expenses.length;
  const averageAmount = expenseCount > 0 ? totalAmount / expenseCount : 0;
  const expenseToSalesRatio =
    totalSales > 0 ? (totalAmount / totalSales) * 100 : 0;

  const byCategory = addPercentages(
    sumBy(expenses, (expense) => expense.expenseCategoryName || "Sin tipo"),
    totalAmount,
  );
  const byBranch = addPercentages(
    sumBy(expenses, (expense) => expense.branchName || "Sin sucursal"),
    totalAmount,
  );
  const byBusinessUnit = addPercentages(
    sumBy(expenses, getExpenseLabel),
    totalAmount,
  );

  return {
    totalAmount,
    expenseCount,
    averageAmount,
    expenseToSalesRatio,
    topCategory: byCategory[0],
    topBranch: byBranch[0],
    topBusinessUnit: byBusinessUnit[0],
    byCategory,
    byBranch,
    byBusinessUnit,
  };
};

