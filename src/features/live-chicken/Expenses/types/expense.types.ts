import type { ExpenseCategoryCode, ExpenseType } from "@/core/api/types";
// expense.types.ts

export enum VehicleExpenseCategory {
  MAINTENANCE = "MAINTENANCE",
  REPAIRMENT = "REPAIRMENT",
  OTHER = "OTHER",
}

/* ---------- Nested payloads ---------- */

export interface FoodExpenseCreateRequestDTO {
  cedisId: number;
  weight: number;
}

export interface FuelExpenseCreateRequestDTO {
  vehicleId: number;
  employeeId: number;
  routeId: number;
}

export interface VehicleExpenseCreateRequestDTO {
  vehicleId: number;
  employeeId: number;
  category: VehicleExpenseCategory;
}

/* ---------- Create Expense ---------- */

export interface ExpenseCreateRequestDTO {
  categoryCode: ExpenseCategoryCode;
  reason?: string;
  amount: number;
  date: string;

  fuel?: FuelExpenseCreateRequestDTO;
  food?: FoodExpenseCreateRequestDTO;
  vehicle?: VehicleExpenseCreateRequestDTO;
}
export interface ExpenseUpdateRequestDTO {
  categoryCode: ExpenseCategoryCode;
  reason?: string;
  amount: number;
  date: string;

  fuel?: FuelExpenseCreateRequestDTO;
  food?: FoodExpenseCreateRequestDTO;
  vehicle?: VehicleExpenseCreateRequestDTO;
}

/* ---------- Response ---------- */

export interface ExpenseResponseDTO {
  id: number;

  categoryCode: ExpenseCategoryCode;
  categoryName: string;
  expenseType: ExpenseType;

  reason?: string;
  amount: number;
  date: string;

  // Food
  cedisName?: string;
  weight?: number;

  // Vehicle
  vehicleName?: string;
  employeeName?: string;
  vehicleCategory?: VehicleExpenseCategory;

  // Fuel
  routeName?: string;
}
export interface ExpenseDetailResponseDTO {
  id: number;

  categoryCode: ExpenseCategoryCode;

  reason: string | null;
  amount: number;
  date: string; // yyyy-MM-dd

  food?: FoodExpenseDTO;
  fuel?: FuelExpenseDTO;
  vehicle?: VehicleExpenseDTO;
}

export interface FoodExpenseDTO {
  cedisId: number;
  weight: number;
}
export interface FuelExpenseDTO {
  vehicleId: number;
  employeeId: number;
  routeId: number;
}
export interface VehicleExpenseDTO {
  vehicleId: number;
  employeeId: number;
  category: VehicleExpenseCategory;
}
