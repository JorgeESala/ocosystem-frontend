import { http } from "@/shared/api/http";
import type {
  InboundBatch,
  CreateInboundBatchRequest,
  UpdateInboundBatchRequest,
} from "../types";

const BASE_URL = "/api/live-chicken/inbound-batches";

export const getInboundBatches = async (): Promise<InboundBatch[]> => {
  const { data } = await http.get<InboundBatch[]>(BASE_URL);
  return data;
};

export const getLatestInboundBatches = async (
  limit = 15,
): Promise<InboundBatch[]> => {
  const { data } = await http.get<InboundBatch[]>(`${BASE_URL}/latest`, {
    params: { limit },
  });

  return data;
};
export const getInboundBatchById = async (
  id: number,
): Promise<InboundBatch> => {
  const { data } = await http.get<InboundBatch>(`${BASE_URL}/${id}`);
  return data;
};

export const getInboundBatchesByDateRange = async (
  startDate: Date,
  endDate: Date,
): Promise<InboundBatch[]> => {
  const { data } = await http.get<InboundBatch[]>(BASE_URL, {
    params: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    },
  });

  return data;
};

export const createInboundBatch = async (
  payload: CreateInboundBatchRequest,
): Promise<InboundBatch> => {
  const { data } = await http.post<InboundBatch>(BASE_URL, payload);
  return data;
};

export const updateInboundBatch = async (
  id: number,
  payload: UpdateInboundBatchRequest,
): Promise<InboundBatch> => {
  const { data } = await http.put<InboundBatch>(`${BASE_URL}/${id}`, payload);

  return data;
};
export const deleteInboundBatch = async (id: number): Promise<void> => {
  await http.delete(`${BASE_URL}/${id}`);
};
