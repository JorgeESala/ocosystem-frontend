import { http } from "@/shared/api/http";
import type { ExcludedBranch } from "../types/excluded-branch.types";

const API_BASE = "/api/v1/branches/excluded-branches";

export const excludedBranchesApi = {
  list: async (): Promise<ExcludedBranch[]> => {
    const { data } = await http.get<ExcludedBranch[]>(API_BASE);
    return data;
  },

  create: async (
    branchId: number,
    reason?: string,
  ): Promise<ExcludedBranch> => {
    const { data } = await http.post<ExcludedBranch>(API_BASE, {
      branchId,
      reason,
    });
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_BASE}/${id}`);
  },
};
