import { http } from "@/shared/api/http";
import { visibleCatalogProducts } from "@/features/branches/product-catalog/utils/catalog-filter";
import type {
  CatalogProduct,
  ReceiptDetailDTO,
  ReceiptFilters,
  ReceiptLineDTO,
  ReceiptSummaryDTO,
  RecordCostPayload,
  ResolveLinePayload,
  ResolveLineResponse,
  ResolveWithProductPayload,
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

  resolveWithProduct: async (
    lineId: number,
    payload: ResolveWithProductPayload,
  ): Promise<ResolveLineResponse> => {
    const { data } = await http.post(
      `/api/receipts/lines/${lineId}/resolve-with-product`,
      payload,
    );
    return data;
  },

  catalogProducts: async (): Promise<CatalogProduct[]> => {
    const { data } = await http.get<CatalogProduct[]>("/api/products");
    return visibleCatalogProducts(data);
  },

  unresolved: async (): Promise<ReceiptLineDTO[]> => {
    const { data } = await http.get<ReceiptLineDTO[]>("/api/receipts/lines/unresolved");
    return data;
  },
};
