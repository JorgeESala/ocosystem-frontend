import { http } from "@/shared/api/http";
import { CreatePaymentRequest, PaymentResponse } from "../types";
import type {
  CompensationPaymentAPRequest,
  CompensationPaymentResponse,
} from "../../types";

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
