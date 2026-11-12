import type { ExpensesUnitType } from "../types/expense.types";

export const expenseKeys = (unitType: ExpensesUnitType) => ({
  all: ["expenses", unitType] as const,
  between: (start: string, end: string) =>
    [...expenseKeys(unitType).all, "between", start, end] as const,
  comparison: (
    start: string,
    end: string,
    previousStart: string,
    previousEnd: string,
    categories: string,
    expenseTypes: string,
  ) =>
    [
      ...expenseKeys(unitType).all,
      "comparison",
      start,
      end,
      previousStart,
      previousEnd,
      categories,
      expenseTypes,
    ] as const,
  detail: (id: number) => [...expenseKeys(unitType).all, "detail", id] as const,
});
