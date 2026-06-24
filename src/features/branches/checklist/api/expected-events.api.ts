import { http } from "@/shared/api/http";
import type {
  ExpectedEvent,
  ExpectedEventBulkRequest,
  ExpectedEventBulkResponse,
} from "../types/expected-event.types";

const API_BASE = "/api/v1/branches/expected-events";

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) {
      continue;
    }
    search.set(k, String(v));
  }
  return search.toString();
};

export const expectedEventsApi = {
  list: async (params: { branchId?: number; from?: string; to?: string }): Promise<ExpectedEvent[]> => {
    const qs = buildQueryString({
      branchId: params.branchId,
      from: params.from,
      to: params.to,
    });
    const { data } = await http.get<ExpectedEvent[]>(`${API_BASE}?${qs}`);
    return data;
  },

  create: async (event: Omit<ExpectedEvent, "id" | "branchName" | "createdBy">): Promise<ExpectedEvent> => {
    const { data } = await http.post<ExpectedEvent>(API_BASE, event);
    return data;
  },

  createBulk: async (request: ExpectedEventBulkRequest): Promise<ExpectedEventBulkResponse> => {
    const { data } = await http.post<ExpectedEventBulkResponse>(`${API_BASE}/bulk`, request);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`${API_BASE}/${id}`);
  },
};
