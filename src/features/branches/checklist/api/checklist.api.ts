import { http } from "@/shared/api/http";
import type {
  ChecklistQueryParams,
  ChecklistResponse,
  PerformanceQueryParams,
} from "../types/checklist.types";

const API_BASE = "/api/v1/branches/checklist";

const buildQueryString = (params: Record<string, string | number | number[] | undefined>): string => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) {
      continue;
    }
    if (Array.isArray(v)) {
      if (v.length > 0) {
        search.set(k, v.join(","));
      }
      continue;
    }
    search.set(k, String(v));
  }
  return search.toString();
};

export const checklistApi = {
  getDaily: async (params: ChecklistQueryParams): Promise<ChecklistResponse> => {
    const qs = buildQueryString({ date: params.date, branchIds: params.branchIds });
    const { data } = await http.get<ChecklistResponse>(`${API_BASE}?${qs}`);
    return data;
  },

  getPerformance: async (params: PerformanceQueryParams): Promise<ChecklistResponse> => {
    const qs = buildQueryString({
      from: params.from,
      to: params.to,
      branchIds: params.branchIds,
    });
    const { data } = await http.get<ChecklistResponse>(`${API_BASE}/performance?${qs}`);
    return data;
  },

  getCurrentWeekPerformance: async (branchIds?: number[]): Promise<ChecklistResponse> => {
    const qs = buildQueryString({ branchIds });
    const { data } = await http.get<ChecklistResponse>(`${API_BASE}/performance/current-week?${qs}`);
    return data;
  },
};
