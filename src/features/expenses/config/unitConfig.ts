import type { ExpensesUnitType } from "../types/expense.types";

export interface ExpenseUnitConfig {
  label: string;
  description: string;
}

export const EXPENSE_UNIT_CONFIG: Record<ExpensesUnitType, ExpenseUnitConfig> = {
  LIVE_CHICKEN: {
    label: "Pollo Vivo",
    description: "Control de gastos del negocio de pollo vivo.",
  },
  EGG: {
    label: "Huevo",
    description: "Control de gastos del negocio de huevo.",
  },
};