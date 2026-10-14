import type { BranchExpenseResponseDTO } from "../types";

export interface ExpenseSummaryItem {
  id?: number;
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
  getId: (expense: BranchExpenseResponseDTO) => number | null | undefined,
  getLabel: (expense: BranchExpenseResponseDTO) => string,
) => {
  const map = new Map<
    string,
    {
      id?: number;
      label: string;
      totalAmount: number;
      expenseCount: number;
    }
  >();

  for (const expense of expenses) {
    const label = getLabel(expense);
    const id = getId(expense) ?? undefined;
    const current = map.get(label);
    if (!current) {
      map.set(label, {
        id,
        label,
        totalAmount: Number(expense.amount || 0),
        expenseCount: 1,
      });
      continue;
    }

    if (current.id == null && id != null) current.id = id;
    current.totalAmount += Number(expense.amount || 0);
    current.expenseCount += 1;
  }

  return [...map.values()];
};

const addPercentages = (
  items: Array<{
    id?: number;
    label: string;
    totalAmount: number;
    expenseCount: number;
  }>,
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
    sumBy(
      expenses,
      (expense) => expense.branchId,
      (expense) => expense.branchName || "Sin sucursal",
    ),
    totalAmount,
  );
  const byBusinessUnit = addPercentages(
    sumBy(
      expenses,
      (expense) => expense.businessUnitCategoryId,
      (expense) =>
        expense.businessUnitCategoryName ??
        expense.businessUnitName ??
        "Sin unidad",
    ),
    totalAmount,
  );
  const byExpenseCategory = addPercentages(
    sumBy(
      expenses,
      (expense) => expense.expenseCategoryId,
      (expense) => expense.expenseCategoryName || "Sin tipo",
    ),
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
