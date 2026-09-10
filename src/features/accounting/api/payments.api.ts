import { http } from "@/shared/api/http";
import type {
  CreateAdvancePaymentRequest,
  CreateFifoPaymentRequest,
  CreatePaymentRequest,
  FifoPaymentPreview,
  PaymentApplication,
  PaymentResponse,
} from "../types/payment.types";
import type {
  CompensationPaymentAPRequest,
  CompensationPaymentResponse,
} from "../types/accounting-entity.types";

export const createPayment = (payload: CreatePaymentRequest) => {
  return http.post<PaymentResponse>("/api/accounting/payments", payload);
};

export const createFifoPayment = (payload: CreateFifoPaymentRequest) => {
  return http.post<PaymentResponse>("/api/accounting/payments/fifo", payload);
};

export const previewFifoPayment = (payload: CreateFifoPaymentRequest) => {
  return http.post<FifoPaymentPreview>(
    "/api/accounting/payments/fifo/preview",
    payload,
  );
};

export const createAdvancePayment = (payload: CreateAdvancePaymentRequest) => {
  return http.post<PaymentResponse>(
    "/api/accounting/payments/advance",
    payload,
  );
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

export const reverseApplication = (movementId: number, reason: string) => {
  return http.post(
    `/api/accounting/accounts-payable-movements/${movementId}/reverse`,
    { reason },
  );
};

export interface ApplyRemainderPayload {
  accountsPayableId: number;
  amount?: number;
  note?: string;
}

export const applyRemainder = (
  paymentId: number,
  payload: ApplyRemainderPayload,
) => {
  return http.post<PaymentResponse>(
    `/api/accounting/payments/${paymentId}/apply`,
    payload,
  );
};

export const fetchRecentPayments = async (
  limit = 20,
): Promise<PaymentResponse[]> => {
  const { data } = await http.get<PaymentResponse[]>(
    `/api/accounting/payments/recent?limit=${limit}`,
  );
  return data;
};

export const fetchUnappliedPayments = async (
  payerId: number,
  receiverId: number,
): Promise<PaymentResponse[]> => {
  const { data } = await http.get<PaymentResponse[]>(
    `/api/accounting/payments/unapplied?payerId=${payerId}&receiverId=${receiverId}`,
  );
  return data;
};

export const fetchPaymentsByPair = async (
  payerId: number,
  receiverId: number,
): Promise<PaymentResponse[]> => {
  const { data } = await http.get<PaymentResponse[]>(
    `/api/accounting/payments/by-pair?payerId=${payerId}&receiverId=${receiverId}`,
  );
  return data;
};

export const fetchPaymentApplications = async (
  paymentId: number,
): Promise<PaymentApplication[]> => {
  const { data } = await http.get<PaymentApplication[]>(
    `/api/accounting/payments/${paymentId}/applications`,
  );
  return data;
};

export const applyCreditsToAccount = (accountsPayableId: number) => {
  return http.post<ApplyCreditsResponse>(
    `/api/accounting/accounts-payable/${accountsPayableId}/apply-credits`,
  );
};

export interface AppliedCredit {
  paymentId: number;
  folio?: string;
  amount: number;
}

export interface ApplyCreditsResponse {
  payments: AppliedCredit[];
  totalApplied: number;
  remainingBalance: number;
}
