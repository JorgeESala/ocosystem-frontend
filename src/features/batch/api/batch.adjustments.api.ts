import { http } from "@/shared/api/http";

export interface BatchAdjustment {
  id?: number;
  batchId: number;
  weight: number;
  quantity: number;
  reason: string;
  adjustmentDate: string;
}

export const createAdjustment = async (adjustment: BatchAdjustment) => {
  const { data } = await http.post<BatchAdjustment>(
    `/api/v1/batches/${adjustment.batchId}/adjustments`,
    adjustment,
  );
  return data;
};
export const updateBatchAdjustment = async (id: number, data: any) => {
  const response = await http.put(`/api/v1/batch-adjustments/${id}`, data);
  return response.data;
};
