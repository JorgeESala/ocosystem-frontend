import { VehicleExpenseCategory } from "../types/expense.types";

export const VehicleExpenseCategoryLabel: Record<
  VehicleExpenseCategory,
  string
> = {
  [VehicleExpenseCategory.MAINTENANCE]: "Mantenimiento",
  [VehicleExpenseCategory.REPAIRMENT]: "Reparación",
  [VehicleExpenseCategory.OTHER]: "Otro",
};
