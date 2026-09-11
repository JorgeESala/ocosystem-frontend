import type {
  PaymentApplication,
  PaymentResponse,
} from "../types/payment.types";
import type {
  AccountsPayableMovementResponse,
  AccountsPayableResponse,
} from "@/features/live-chicken/accounting/accounts-payable/types";

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

export const hasAvailableCredit = (account: {
  availableCredit?: number;
}): boolean => (account.availableCredit ?? 0) > 0;

export const totalUnapplied = (payments: PaymentResponse[]): number =>
  payments
    .filter(hasUnappliedCredit)
    .reduce((sum, p) => sum + (p.remainingAmount ?? 0), 0);

export const paymentSplit = (payment: PaymentResponse): PaymentSplit => {
  const parked = Math.max(payment.remainingAmount ?? 0, 0);
  const applied = Math.max(payment.amount - parked, 0);
  return { applied, parked };
};

export const isCancellablePayment = (payment: PaymentResponse): boolean =>
  payment.status === "ACTIVE";

export const CREDIT_APPLICATION_NOTE_PREFIX = "Aplicación de saldo a favor";

export const isCreditApplicationNote = (note?: string | null): boolean =>
  !!note && note.startsWith(CREDIT_APPLICATION_NOTE_PREFIX);

export interface CancelImpact {
  debts: number;
  total: number;
}

export const summarizeCancelImpact = (
  applications: PaymentApplication[],
): CancelImpact => ({
  debts: applications.length,
  total: applications.reduce((sum, a) => sum + a.appliedAmount, 0),
});

export interface CreditApplicationPlanItem {
  paymentId: number;
  folio?: string;
  amount: number;
}

export interface CreditApplicationPlan {
  items: CreditApplicationPlanItem[];
  totalApplied: number;
  resultingBalance: number;
}

export const planCreditApplication = (
  credits: PaymentResponse[],
  balance: number,
): CreditApplicationPlan => {
  const items: CreditApplicationPlanItem[] = [];
  let remaining = Math.max(balance, 0);

  for (const credit of credits) {
    if (remaining <= 0) break;
    if (!hasUnappliedCredit(credit)) continue;
    const amount = Math.min(credit.remainingAmount ?? 0, remaining);
    if (amount <= 0) continue;
    items.push({ paymentId: credit.id, folio: credit.folio, amount });
    remaining -= amount;
  }

  const totalApplied = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, totalApplied, resultingBalance: remaining };
};

export const isStandaloneAccount = (
  account: AccountsPayableResponse,
): boolean =>
  (account.sourceType === "OTHER" || account.sourceType === "ADJUSTMENT") &&
  account.sourceId == null &&
  account.sourceBatchId == null;

export const isReversibleMovement = (
  movement: AccountsPayableMovementResponse,
  account: AccountsPayableResponse,
): boolean =>
  movement.movementType === "PAYMENT" &&
  movement.paymentId != null &&
  isStandaloneAccount(account);
