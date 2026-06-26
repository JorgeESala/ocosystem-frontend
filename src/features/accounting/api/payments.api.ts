import { http } from "@/shared/api/http";
import type {
  CreatePaymentRequest,
  PaymentResponse,
} from "../types/payment.types";
import type {
  CompensationPaymentAPRequest,
  CompensationPaymentResponse,
} from "../types/accounting-entity.types";

export const createPayment = (payload: CreatePaymentRequest) => {
  return http.post<PaymentResponse>("/api/accounting/payments", payload);
};
export const createCompensationPaymentFromAP = (
  data: CompensationPaymentAPRequest,
) =>
  http.post<CompensationPaymentResponse>(
    "/api/compensation-payments/from-ap",
    data,
  );

export const cancelPayment = (id: number) => {
  return http.post<void>(`/api/accounting/payments/${id}/cancel`);
};

export const fetchRecentPayments = async (
  limit = 20,
): Promise<PaymentResponse[]> => {
  const { data } = await http.get<PaymentResponse[]>(
    `/api/accounting/payments/recent?limit=${limit}`,
  );
  return data;
};
