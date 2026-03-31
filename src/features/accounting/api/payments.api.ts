import { http } from "@/shared/api/http";
import type { CreatePaymentRequest } from "../types/payment.types";
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
