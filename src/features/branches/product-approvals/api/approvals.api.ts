import { http } from "@/shared/api/http";
import type {
  ApproveProductPayload,
  BranchApiKeyDTO,
  CreatedApiKeyDTO,
  PendingProductDTO,
} from "../types";

export const getPendingProducts = async (): Promise<PendingProductDTO[]> => {
  const { data } = await http.get("/api/products/pending");
  return data;
};

export const approveProduct = async (
  barcode: string,
  payload: ApproveProductPayload,
) => {
  const { data } = await http.put(`/api/products/${barcode}/approve`, payload);
  return data;
};

export const getApiKeys = async (): Promise<BranchApiKeyDTO[]> => {
  const { data } = await http.get("/api/branch-app/keys");
  return data;
};

export const createApiKey = async (payload: {
  branchId: number;
  label: string | null;
}): Promise<CreatedApiKeyDTO> => {
  const { data } = await http.post("/api/branch-app/keys", payload);
  return data;
};

export const revokeApiKey = async (id: number): Promise<void> => {
  await http.delete(`/api/branch-app/keys/${id}`);
};