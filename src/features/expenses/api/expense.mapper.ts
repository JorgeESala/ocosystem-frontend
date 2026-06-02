import { ExpenseCategoryCode } from "@/core/api/types";
import type { ExpenseCreateRequestDTO } from "../types/expense.types";

export function mapFormToCreateDTO(
  categoryCode: ExpenseCategoryCode,
  form: any,
): ExpenseCreateRequestDTO {
  const base = {
    categoryCode,
    amount: Number(form.amount),
    reason: form.reason,
    date: form.date.toISOString().split("T")[0],
  };

  switch (categoryCode) {
    case ExpenseCategoryCode.FUEL:
      return {
        ...base,
        fuel: {
          vehicleId: Number(form.fuel.vehicleId),
          employeeId: Number(form.fuel.employeeId),
          routeId: Number(form.fuel.routeId),
        },
      };

    case ExpenseCategoryCode.FOOD:
      return {
        ...base,
        food: {
          cedisId: Number(form.food.cedisId),
          weight: Number(form.food.weight),
        },
      };

    case ExpenseCategoryCode.VEHICLE:
      return {
        ...base,
        vehicle: {
          vehicleId: Number(form.vehicle.vehicleId),
          employeeId: Number(form.vehicle.employeeId),
          category: form.vehicle.category,
        },
      };

    default:
      return base;
  }
}

export function mapFormToUpdateDTO(
  categoryCode: ExpenseCategoryCode,
  form: any,
): ExpenseCreateRequestDTO {
  return mapFormToCreateDTO(categoryCode, form);
}