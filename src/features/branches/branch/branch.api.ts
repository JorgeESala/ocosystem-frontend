import { http } from "@/shared/api/http";
import type { Branch } from "./types";

export const getBranches = async (): Promise<Branch[]> => {
  const response = await http.get<Branch[]>("/api/branches");
  return response.data;
};

// Por si necesitas uno solo en el futuro
export const getBranchById = async (id: number): Promise<Branch> => {
  const response = await http.get<Branch>(`/api/branches/${id}`);
  return response.data;
};
