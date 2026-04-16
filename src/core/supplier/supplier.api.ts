import { http } from "@/shared/api/http";
import type { Supplier } from "../api/types";

export const getSuppliers = async () => {
  // El interceptor de 'http' ya añade el X-Business-Code
  const { data } = await http.get<Supplier[]>("/api/v1/suppliers");
  return data;
};

export const createSupplier = async (supplier: Partial<Supplier>) => {
  const { data } = await http.post<Supplier>("/api/v1/suppliers", supplier);
  return data;
};
