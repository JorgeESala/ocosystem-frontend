import { http } from "@/shared/api/http";
import type {
  ReceiptDetailDTO,
  ReceiptFilters,
  ReceiptLineDTO,
  ReceiptSummaryDTO,
  RecordCostPayload,
  ResolveLinePayload,
} from "../types";

export const productReceiptsApi = {
  list: async (filters: ReceiptFilters): Promise<ReceiptSummaryDTO[]> => {
    const { data } = await http.get<ReceiptSummaryDTO[]>("/api/receipts", {
      params: {
        branchIds: filters.branchIds.length > 0 ? filters.branchIds.join(",") : undefined,
        from: filters.from ?? undefined,
        to: filters.to ?? undefined,
        pendingCostOnly: filters.pendingCostOnly || undefined,
        unresolvedOnly: filters.unresolvedOnly || undefined,
      },
    });
    return data;
  },

  detail: async (id: number): Promise<ReceiptDetailDTO> => {
    const { data } = await http.get<ReceiptDetailDTO>(`/api/receipts/${id}`);
    return data;
  },

  recordCost: async (lineId: number, payload: RecordCostPayload) => {
    const { data } = await http.post(`/api/receipts/lines/${lineId}/costs`, payload);
    return data;
  },

  resolveLine: async (
    lineId: number,
    payload: ResolveLinePayload,
  ): Promise<ReceiptLineDTO> => {
    const { data } = await http.put(`/api/receipts/lines/${lineId}/resolve`, payload);
    return data;
  },

  unresolved: async (): Promise<ReceiptLineDTO[]> => {
    const { data } = await http.get<ReceiptLineDTO[]>("/api/receipts/lines/unresolved");
    return data;
  },
};
