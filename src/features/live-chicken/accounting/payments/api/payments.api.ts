import { http } from "@/shared/api/http";
import { CreatePaymentRequest, PaymentResponse } from "../types";

export const createPayment = (payload: CreatePaymentRequest) => {
  return http.post<PaymentResponse>("/api/accounting/payments", payload);
};
