export type ExpenseType = "FUEL" | "FOOD" | "VEHICLE" | "GENERIC";
export enum ExpenseCategoryCode {
  FUEL = "FUEL",
  FOOD = "FOOD",
  VEHICLE = "VEHICLE",
  WATER = "WATER",
  ELECTRICITY = "ELECTRICITY",
  INTERNET = "INTERNET",
  RENT = "RENT",
  OTHER = "OTHER",
}
export type FuelType = "GASOLINE" | "DIESEL";

export const FuelTypeLabels: Record<FuelType, string> = {
  GASOLINE: "Gasolina",
  DIESEL: "Diésel",
};

export const ExpenseCategoryLabels: Record<ExpenseCategoryCode, string> = {
  FUEL: "Combustible",
  FOOD: "Alimento",
  VEHICLE: "Vehículo",
  WATER: "Agua",
  ELECTRICITY: "Luz",
  INTERNET: "Internet",
  RENT: "Renta",
  OTHER: "Otro",
};

export interface ExpenseDTO {
  id?: number;
  categoryCode: ExpenseCategoryCode;
  amount: number;
  date: string;
  description?: string;
}

export interface Vehicle {
  id: number;
  name: string;
  fuelType: FuelType;
}

export interface VehicleResponseDTO {
  id: number;
  name: string;
  fuelType: FuelType;
}
