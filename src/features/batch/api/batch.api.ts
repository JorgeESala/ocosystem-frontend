import { http } from "@/shared/api/http";
import type {
  BatchDetailView,
  MermaReport,
  SalesByClientData,
  WeeklySalesData,
} from "../types.batch";

const API_BASE = "/api/v1";

export const getBatches = async (unit: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams({ unit });
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  const { data } = await http.get(`${API_BASE}/batches?${params.toString()}`);
  return data;
};

export const getBatchById = async (id: number): Promise<import("../types.batch").BatchResponseDTO> => {
  const { data } = await http.get<import("../types.batch").BatchResponseDTO>(
    `${API_BASE}/batches/${id}`,
  );
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

export const bulkUpdateBatchSaleRoute = async (
  saleIds: number[],
  routeId: number,
) => {
  const response = await http.put(`${API_BASE}/batch-sales/bulk-update-route`, {
    saleIds,
    routeId,
  });
  return response.data as { updated: number };
};

export const getBatchSales = async (batchId: number) => {
  const { data } = await http.get(`${API_BASE}/batch-sales/batch/${batchId}`);
  return data;
};

export const getBatchAdjustments = async (batchId: number) => {
  const { data } = await http.get(
    `${API_BASE}/batches/${batchId}/adjustments`,
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

export const getWeeklySalesReport = async (
  startDate: string,
  endDate: string,
): Promise<WeeklySalesData[]> => {
  const params = new URLSearchParams({ startDate, endDate });
  const { data } = await http.get<WeeklySalesData[]>(
    `${API_BASE}/batches/weekly-sales?${params}`,
  );
  return data;
};

export const getSalesByClient = async (
  startDate: string,
  endDate: string,
): Promise<SalesByClientData[]> => {
  const params = new URLSearchParams({ startDate, endDate });
  const { data } = await http.get<SalesByClientData[]>(
    `${API_BASE}/batches/sales-by-client?${params}`,
  );
  return data;
};

export const getMermaReport = async (
  start: string,
  end: string,
  trainingDate?: string,
  branchIds?: number[],
): Promise<MermaReport> => {
  const params = new URLSearchParams({ start, end });
  if (trainingDate) params.set("trainingDate", trainingDate);
  if (branchIds && branchIds.length > 0) {
    branchIds.forEach((id) => params.append("branchIds", String(id)));
  }
  const { data } = await http.get<MermaReport>(
    `${API_BASE}/batches/merma?${params}`,
  );
  return data;
};
