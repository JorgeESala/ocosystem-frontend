import type { PaymentResponse } from "../types/payment.types";

export interface PaymentSplit {
  applied: number;
  parked: number;
}

export const splitPaymentApplication = (
  amount: number,
  balance: number,
): PaymentSplit => {
  const applied = Math.min(amount, Math.max(balance, 0));
  return { applied, parked: amount - applied };
};

export const hasUnappliedCredit = (payment: PaymentResponse): boolean =>
  payment.status === "ACTIVE" && (payment.remainingAmount ?? 0) > 0;

export const totalUnapplied = (payments: PaymentResponse[]): number =>
  payments
    .filter(hasUnappliedCredit)
    .reduce((sum, p) => sum + (p.remainingAmount ?? 0), 0);
