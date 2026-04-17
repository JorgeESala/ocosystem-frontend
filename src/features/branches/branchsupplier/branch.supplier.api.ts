import { http } from "@/shared/api/http";

export interface BranchSupplier {
  id: number; // ID en accounting_entity
  name: string; // Nombre de la entidad
  originalId: number; // ID en su tabla de origen (Cedis, etc.)
}

export const getBranchSuppliers = async (): Promise<BranchSupplier[]> => {
  const response = await http.get<BranchSupplier[]>("/api/branches/suppliers");
  return response.data;
};
