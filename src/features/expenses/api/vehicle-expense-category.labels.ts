import { VehicleExpenseCategory } from "../types/expense.types";

export const VehicleExpenseCategoryLabel: Record<
  VehicleExpenseCategory,
  string
> = {
  MAINTENANCE: "Mantenimiento",
  REPAIRMENT: "Reparacion",
  OTHER: "Otro",
};
