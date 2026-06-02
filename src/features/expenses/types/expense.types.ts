import type { ExpenseCategoryCode, ExpenseType } from "@/core/api/types";

export enum VehicleExpenseCategory {
  MAINTENANCE = "MAINTENANCE",
  REPAIRMENT = "REPAIRMENT",
  OTHER = "OTHER",
}

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

export interface ExpenseResponseDTO {
  id: number;
  categoryCode: ExpenseCategoryCode;
  categoryName: string;
  expenseType: ExpenseType;
  reason?: string;
  amount: number;
  date: string;
  cedisName?: string;
  weight?: number;
  vehicleName?: string;
  employeeName?: string;
  vehicleCategory?: VehicleExpenseCategory;
  routeName?: string;
}

export interface ExpenseDetailResponseDTO {
  id: number;
  categoryCode: ExpenseCategoryCode;
  reason: string | null;
  amount: number;
  date: string;
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

export type ExpensesUnitType = "LIVE_CHICKEN" | "EGG";

export interface ExpenseFilters {
  startDate: Date;
  endDate: Date;
}