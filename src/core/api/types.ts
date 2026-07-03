export type ExpenseType =
  | "SERVICIOS"
  | "INSUMOS"
  | "COMBUSTIBLE"
  | "OTROS"
  | "NOMINA"
  | "RENTA"
  | "MANTENIMIENTO";

export enum ExpenseCategoryCode {
  FUEL = "FUEL",
  FOOD = "FOOD",
  VEHICLE = "VEHICLE",
  WATER = "WATER",
  ELECTRICITY = "ELECTRICITY",
  INTERNET = "INTERNET",
  RENT = "RENT",
  PAYROLL = "PAYROLL",
  OTHER = "OTHER",
}
export type FuelType = "GASOLINE" | "DIESEL";

export const FuelTypeLabels: Record<FuelType, string> = {
  GASOLINE: "Gasolina",
  DIESEL: "Diesel",
};

export const ExpenseCategoryLabels: Record<ExpenseCategoryCode, string> = {
  FUEL: "Combustible",
  FOOD: "Alimento",
  VEHICLE: "Vehiculo",
  WATER: "Agua",
  ELECTRICITY: "Luz",
  INTERNET: "Internet",
  RENT: "Renta",
  PAYROLL: "Nomina",
  OTHER: "Otro",
};

export const ExpenseTypeLabels: Record<ExpenseType, string> = {
  SERVICIOS: "Servicios",
  INSUMOS: "Insumos",
  COMBUSTIBLE: "Combustible",
  OTROS: "Otros",
  NOMINA: "Nomina",
  RENTA: "Renta",
  MANTENIMIENTO: "Mantenimiento",
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
export interface Supplier {
  id: number;
  name: string;
  contactInfo?: string;
}
export interface Route {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}
export interface Client {
  id: number;
  name: string;
  accountingEntityId?: number;
  localityId?: number;
  localityName?: string;
  isInternalBranch: boolean;
  businessName?: string;
  active?: boolean;
}
