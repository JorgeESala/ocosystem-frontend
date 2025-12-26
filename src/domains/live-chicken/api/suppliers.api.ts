import { http } from "@/shared/api/http";
import type { Supplier } from "../types";

const BASE_URL = "/api/live-chicken/suppliers";

export const getSuppliers = async (): Promise<Supplier[]> => {
  const { data } = await http.get<Supplier[]>(BASE_URL);
  return data;
};
