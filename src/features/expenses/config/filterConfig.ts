import { ExpenseCategoryCode, ExpenseCategoryLabels, ExpenseTypeLabels } from "@/core/api/types";

export interface FilterChipOption {
  value: string;
  label: string;
  color: string;
}

export const CATEGORY_CHIP_OPTIONS: FilterChipOption[] = [
  { value: ExpenseCategoryCode.WATER, label: ExpenseCategoryLabels.WATER, color: "blue" },
  { value: ExpenseCategoryCode.ELECTRICITY, label: ExpenseCategoryLabels.ELECTRICITY, color: "yellow" },
  { value: ExpenseCategoryCode.INTERNET, label: ExpenseCategoryLabels.INTERNET, color: "purple" },
  { value: ExpenseCategoryCode.RENT, label: ExpenseCategoryLabels.RENT, color: "indigo" },
  { value: ExpenseCategoryCode.PAYROLL, label: ExpenseCategoryLabels.PAYROLL, color: "pink" },
  { value: ExpenseCategoryCode.FUEL, label: ExpenseCategoryLabels.FUEL, color: "cyan" },
  { value: ExpenseCategoryCode.FOOD, label: ExpenseCategoryLabels.FOOD, color: "green" },
  { value: ExpenseCategoryCode.VEHICLE, label: ExpenseCategoryLabels.VEHICLE, color: "orange" },
  { value: ExpenseCategoryCode.OTHER, label: ExpenseCategoryLabels.OTHER, color: "slate" },
];

export const EXPENSE_TYPE_CHIP_OPTIONS: FilterChipOption[] = [
  { value: "SERVICIOS", label: ExpenseTypeLabels.SERVICIOS, color: "blue" },
  { value: "INSUMOS", label: ExpenseTypeLabels.INSUMOS, color: "green" },
  { value: "COMBUSTIBLE", label: ExpenseTypeLabels.COMBUSTIBLE, color: "orange" },
  { value: "MANTENIMIENTO", label: ExpenseTypeLabels.MANTENIMIENTO, color: "yellow" },
  { value: "RENTA", label: ExpenseTypeLabels.RENTA, color: "indigo" },
  { value: "NOMINA", label: ExpenseTypeLabels.NOMINA, color: "pink" },
  { value: "OTROS", label: ExpenseTypeLabels.OTROS, color: "slate" },
];

export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  [ExpenseCategoryCode.WATER]: "blue",
  [ExpenseCategoryCode.ELECTRICITY]: "yellow",
  [ExpenseCategoryCode.INTERNET]: "purple",
  [ExpenseCategoryCode.RENT]: "indigo",
  [ExpenseCategoryCode.PAYROLL]: "pink",
  [ExpenseCategoryCode.FUEL]: "cyan",
  [ExpenseCategoryCode.FOOD]: "green",
  [ExpenseCategoryCode.VEHICLE]: "orange",
  [ExpenseCategoryCode.OTHER]: "slate",
};