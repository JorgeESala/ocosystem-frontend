import { http } from "@/shared/api/http";
import type { ApproveProductPayload, PendingProductDTO } from "../types";

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
