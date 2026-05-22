import { http } from "@/shared/api/http";
import type { BatchDetailView } from "../types.batch";

const API_BASE = "/api/v1";

export const getBatches = async (unit: string) => {
  const { data } = await http.get(`${API_BASE}/batches?unit=${unit}`);
  return data;
};

export const createBatch = async (payload: any) => {
  const { data } = await http.post(`${API_BASE}/batches`, payload);
  return data;
};

export const updateBatch = async (id: number, payload: any) => {
  const { data } = await http.put(`${API_BASE}/batches/${id}`, payload);
  return data;
};

export const createBatchSale = async (payload: any) => {
  const { data } = await http.post(`${API_BASE}/batch-sales`, payload);
  return data;
};
export const updateBatchSale = async (id: number, data: any) => {
  const response = await http.put(`${API_BASE}/batch-sales/${id}`, data);
  return response.data;
};

export const getBatchSales = async (batchId: number) => {
  const { data } = await http.get(`${API_BASE}/batch-sales/batch/${batchId}`);
  return data;
};

export const getBatchAdjustments = async (batchId: number) => {
  const { data } = await http.get(
    `${API_BASE}/batch-adjustments/batch/${batchId}`,
  );
  return data;
};
export const getBatchFullDetail = async (
  id: number,
): Promise<BatchDetailView> => {
  const { data } = await http.get<BatchDetailView>(
    `${API_BASE}/batches/${id}/detail`,
  );
  return data;
};
