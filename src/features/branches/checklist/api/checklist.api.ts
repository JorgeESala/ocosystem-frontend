import { http } from "@/shared/api/http";
import type {
  ChecklistQueryParams,
  ChecklistResponse,
} from "../types/checklist.types";

const API_BASE = "/api/v1/branches/checklist";

const buildQueryString = (params: ChecklistQueryParams): string => {
  const search = new URLSearchParams();
  search.set("date", params.date);
  if (params.branchIds && params.branchIds.length > 0) {
    search.set("branchIds", params.branchIds.join(","));
  }
  return search.toString();
};

export const checklistApi = {
  getDaily: async (params: ChecklistQueryParams): Promise<ChecklistResponse> => {
    const qs = buildQueryString(params);
    const { data } = await http.get<ChecklistResponse>(
      `${API_BASE}?${qs}`,
    );
    return data;
  },
};
