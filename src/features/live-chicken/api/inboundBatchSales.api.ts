import { http } from "@/shared/api/http";
import type {
  InboundBatchSale,
  CreateInboundBatchSaleRequest,
  UpdateInboundBatchSaleRequest,
  CreateInboundBatchSalePayload,
  UpdateInboundBatchSalePayload,
} from "@/features/live-chicken/types";

const BASE_URL = "/api/inbound-batches";

export const getInboundBatchSales = async (
  batchId: number,
): Promise<InboundBatchSale[]> => {
  const { data } = await http.get<InboundBatchSale[]>(
    `${BASE_URL}/${batchId}/sales`,
  );
  return data;
};

export const createInboundBatchSale = async (
  batchId: number,
  data: CreateInboundBatchSalePayload,
): Promise<InboundBatchSale> => {
  const payload: CreateInboundBatchSaleRequest = {
    ...data,
    date: data.date.toISOString().split("T")[0],
  };

  return http.post(`${BASE_URL}/${batchId}/sales`, payload);
};

export const updateInboundBatchSale = async (
  batchId: number,
  saleId: number,
  payload: UpdateInboundBatchSalePayload,
): Promise<InboundBatchSale> => {
  const apiPayload: UpdateInboundBatchSaleRequest = {
    ...payload,
    date: payload.date.toISOString().split("T")[0],
  };

  const { data } = await http.put<InboundBatchSale>(
    `${BASE_URL}/${batchId}/sales/${saleId}`,
    apiPayload,
  );

  return data;
};
