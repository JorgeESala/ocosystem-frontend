import { http } from "@/shared/api/http";
import type { BatchAdjustment } from "../types.batch";

export const createAdjustment = async (adjustment: BatchAdjustment) => {
  const { data } = await http.post<BatchAdjustment>(
    `/api/v1/batches/${adjustment.batchId}/adjustments`,
    adjustment,
  );
  return data;
};
export const updateBatchAdjustment = async (
  batchId: number,
  id: number,
  data: any,
) => {
  const response = await http.put(
    `/api/v1/batches/${batchId}/adjustments/${id}`,
    data,
  );
  return response.data;
};
