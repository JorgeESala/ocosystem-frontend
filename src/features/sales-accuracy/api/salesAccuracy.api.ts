import { http } from "@/shared/api/http";
import type { BranchAccuracyDTO } from "../types";

const BASE_URL = "/api/v1/branches/sales-accuracy";

export const salesAccuracyApi = {
  getMonthlyAccuracy: async (month: string): Promise<BranchAccuracyDTO[]> => {
    const { data } = await http.get<BranchAccuracyDTO[]>(
      `${BASE_URL}?month=${month}`,
    );
    return data;
  },
};
