import { http } from "@/shared/api/http";

export interface ClientPaid {
  payerEntityId: number;
  payerName: string;
  paymentCount: number;
  totalPaid: number;
  unapplied: number;
  compensated: number;
  lastPaymentDate: string | null;
}

export interface PaymentsSummary {
  totalCobrado: number;
  paymentCount: number;
  unappliedTotal: number;
  compensationTotal: number;
  payers: ClientPaid[];
}

export interface PaymentsSummaryParams {
  from: string;
  to: string;
  receiverType: string;
  receiverEntityIds?: number[];
  payerEntityIds?: number[];
}

export const fetchPaymentsSummary = async (
  params: PaymentsSummaryParams,
): Promise<PaymentsSummary> => {
  const search = new URLSearchParams({
    from: params.from,
    to: params.to,
    receiverType: params.receiverType,
  });
  (params.receiverEntityIds ?? []).forEach((id) =>
    search.append("receiverEntityIds", String(id)),
  );
  (params.payerEntityIds ?? []).forEach((id) =>
    search.append("payerEntityIds", String(id)),
  );
  const { data } = await http.get<PaymentsSummary>(
    `/api/read/payments/summary?${search}`,
  );
  return data;
};
